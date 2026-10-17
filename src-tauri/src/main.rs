#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod standalone;

use serde::{Deserialize, Serialize};
use std::{
    fs,
    path::{Component, Path, PathBuf},
    sync::Mutex,
};
use tauri::{
    http::{header, Response, StatusCode},
    Manager,
};
use tauri_plugin_dialog::DialogExt;

#[derive(Deserialize, Serialize)]
struct ProjectFile {
    path: String,
    content: String,
}

#[derive(Default)]
struct PlaytestProject(Mutex<Option<PathBuf>>);

struct DesktopMode {
    game: bool,
}
fn require_editor(mode: &DesktopMode) -> Result<(), String> {
    if mode.game {
        Err("Este comando pertence ao editor, não ao jogo exportado.".into())
    } else {
        Ok(())
    }
}

fn encode_base64(bytes: &[u8]) -> String {
    const TABLE: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = String::with_capacity(bytes.len().div_ceil(3) * 4);
    for chunk in bytes.chunks(3) {
        let a = chunk[0] as usize;
        let b = chunk.get(1).copied().unwrap_or(0) as usize;
        let c = chunk.get(2).copied().unwrap_or(0) as usize;
        out.push(TABLE[a >> 2] as char);
        out.push(TABLE[((a & 3) << 4) | (b >> 4)] as char);
        out.push(if chunk.len() > 1 {
            TABLE[((b & 15) << 2) | (c >> 6)] as char
        } else {
            '='
        });
        out.push(if chunk.len() > 2 {
            TABLE[c & 63] as char
        } else {
            '='
        });
    }
    out
}

fn decode_base64(text: &str) -> Result<Vec<u8>, String> {
    let mut out = Vec::with_capacity(text.len() * 3 / 4);
    let mut acc = 0u32;
    let mut bits = 0;
    for byte in text.bytes() {
        let value = match byte {
            b'A'..=b'Z' => byte - b'A',
            b'a'..=b'z' => byte - b'a' + 26,
            b'0'..=b'9' => byte - b'0' + 52,
            b'+' => 62,
            b'/' => 63,
            b'=' => break,
            b' ' | b'\r' | b'\n' | b'\t' => continue,
            _ => return Err("Conteúdo base64 inválido.".into()),
        } as u32;
        acc = (acc << 6) | value;
        bits += 6;
        if bits >= 8 {
            bits -= 8;
            out.push((acc >> bits) as u8);
        }
    }
    Ok(out)
}

fn canonical_directory(path: &str) -> Result<PathBuf, String> {
    let root =
        fs::canonicalize(path).map_err(|e| format!("Não foi possível acessar a pasta: {e}"))?;
    if !root.is_dir() {
        return Err("A pasta selecionada não existe.".into());
    }
    Ok(root)
}

#[tauri::command]
fn set_playtest_project(
    path: String,
    project: tauri::State<'_, PlaytestProject>,
    mode: tauri::State<'_, DesktopMode>,
) -> Result<(), String> {
    require_editor(&mode)?;
    let root = canonical_directory(&path)?;
    if ![
        "project.rpgreactor",
        "game.rmmzproject",
        "Game.rpgproject",
        "game.rpgproject",
    ]
    .iter()
    .any(|name| root.join(name).is_file())
    {
        return Err("A pasta selecionada não contém um projeto válido.".into());
    }
    *project
        .0
        .lock()
        .map_err(|_| "O estado do playtest está indisponível.")? = Some(root);
    Ok(())
}

fn decode_uri_path(value: &str) -> Result<String, String> {
    let input = value.as_bytes();
    let mut bytes = Vec::with_capacity(input.len());
    let mut i = 0;
    while i < input.len() {
        if input[i] == b'%' {
            if i + 2 >= input.len() {
                return Err("Caminho inválido.".into());
            }
            let hex = |byte: u8| match byte {
                b'0'..=b'9' => Some(byte - b'0'),
                b'a'..=b'f' => Some(byte - b'a' + 10),
                b'A'..=b'F' => Some(byte - b'A' + 10),
                _ => None,
            };
            let hi = hex(input[i + 1]).ok_or("Caminho inválido.")?;
            let lo = hex(input[i + 2]).ok_or("Caminho inválido.")?;
            bytes.push((hi << 4) | lo);
            i += 3;
        } else {
            bytes.push(input[i]);
            i += 1;
        }
    }
    String::from_utf8(bytes).map_err(|_| "Caminho inválido.".into())
}

fn resolve_playtest_file(root: &Path, uri_path: &str) -> Result<(Vec<u8>, &'static str), String> {
    let decoded = decode_uri_path(uri_path)?;
    let relative = decoded.trim_start_matches('/');
    if relative.is_empty() {
        return Err("Arquivo não encontrado.".into());
    }
    let candidate = Path::new(relative);
    if candidate.as_os_str().is_empty()
        || candidate
            .components()
            .any(|part| !matches!(part, Component::Normal(_)))
        || relative.contains(['\\', '\0', ':'])
    {
        return Err("Caminho inválido.".into());
    }
    let canonical =
        fs::canonicalize(root.join(candidate)).map_err(|_| "Arquivo não encontrado.")?;
    if !canonical.starts_with(root) || !canonical.is_file() {
        return Err("Arquivo não encontrado.".into());
    }
    let metadata = fs::metadata(&canonical).map_err(|_| "Arquivo não encontrado.")?;
    if metadata.len() > 256 * 1024 * 1024 {
        return Err("Arquivo acima do limite permitido.".into());
    }
    let content_type = match canonical
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or("")
        .to_ascii_lowercase()
        .as_str()
    {
        "html" | "htm" => "text/html; charset=utf-8",
        "js" | "mjs" => "text/javascript; charset=utf-8",
        "css" => "text/css; charset=utf-8",
        "json" => "application/json; charset=utf-8",
        "xml" => "application/xml; charset=utf-8",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "webp" => "image/webp",
        "gif" => "image/gif",
        "svg" => "image/svg+xml",
        "ogg" | "oga" => "audio/ogg",
        "wav" => "audio/wav",
        "mp3" => "audio/mpeg",
        "m4a" => "audio/mp4",
        "mid" | "midi" => "audio/midi",
        "woff" => "font/woff",
        "woff2" => "font/woff2",
        "ttf" => "font/ttf",
        "otf" => "font/otf",
        "wasm" => "application/wasm",
        _ => "application/octet-stream",
    };
    Ok((
        fs::read(canonical).map_err(|_| "Não foi possível ler o arquivo.")?,
        content_type,
    ))
}

fn playtest_response(status: StatusCode, content_type: &str, body: Vec<u8>) -> Response<Vec<u8>> {
    Response::builder()
        .status(status)
        .header(header::CONTENT_TYPE, content_type)
        .header(header::CACHE_CONTROL, "no-store")
        .header(header::ACCESS_CONTROL_ALLOW_ORIGIN, "*")
        .header(header::ACCESS_CONTROL_ALLOW_METHODS, "GET, HEAD, OPTIONS")
        .header(header::ACCESS_CONTROL_ALLOW_HEADERS, "*")
        .body(body)
        .expect("valid playtest response")
}

fn serve_playtest_request<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
    method: &str,
    uri_path: &str,
) -> Response<Vec<u8>> {
    if method == "OPTIONS" {
        return playtest_response(StatusCode::NO_CONTENT, "text/plain", Vec::new());
    }
    if method != "GET" && method != "HEAD" {
        return playtest_response(
            StatusCode::METHOD_NOT_ALLOWED,
            "text/plain; charset=utf-8",
            b"Method not allowed".to_vec(),
        );
    }
    let root = app
        .state::<PlaytestProject>()
        .0
        .lock()
        .ok()
        .and_then(|value| value.clone());
    let Some(root) = root else {
        return playtest_response(
            StatusCode::NOT_FOUND,
            "text/plain; charset=utf-8",
            b"No playtest project selected".to_vec(),
        );
    };
    match resolve_playtest_file(&root, uri_path) {
        Ok((bytes, content_type)) => playtest_response(
            StatusCode::OK,
            content_type,
            if method == "HEAD" { Vec::new() } else { bytes },
        ),
        Err(_) => playtest_response(
            StatusCode::NOT_FOUND,
            "text/plain; charset=utf-8",
            b"Project file not found".to_vec(),
        ),
    }
}

fn collect_files(
    root: &Path,
    current: &Path,
    out: &mut Vec<String>,
    total: &mut u64,
) -> Result<(), String> {
    let entries =
        fs::read_dir(current).map_err(|e| format!("Não foi possível listar a pasta: {e}"))?;
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let ty = entry.file_type().map_err(|e| e.to_string())?;
        if ty.is_symlink() {
            continue;
        }
        let path = entry.path();
        if ty.is_dir() {
            collect_files(root, &path, out, total)?;
            continue;
        }
        if !ty.is_file() {
            continue;
        }
        let relative = path.strip_prefix(root).map_err(|e| e.to_string())?;
        if relative
            .file_name()
            .is_some_and(|name| name == ".rpgreactor.lock")
        {
            continue;
        }
        let metadata = entry.metadata().map_err(|e| e.to_string())?;
        *total = total.saturating_add(metadata.len());
        if metadata.len() > 128 * 1024 * 1024 || *total > 512 * 1024 * 1024 {
            return Err(
                "Este projeto ultrapassa o limite atual de 512 MiB para abertura no Tauri.".into(),
            );
        }
        out.push(relative.to_string_lossy().replace('\\', "/"));
    }
    Ok(())
}

#[tauri::command]
async fn choose_project_directory(
    app: tauri::AppHandle,
    mode: tauri::State<'_, DesktopMode>,
) -> Result<Option<String>, String> {
    require_editor(&mode)?;
    let (send, receive) = tokio::sync::oneshot::channel();
    app.dialog().file().pick_folder(move |path| {
        let _ = send.send(
            path.map(|value| {
                value
                    .into_path()
                    .map(|path| path.to_string_lossy().into_owned())
                    .map_err(|e| e.to_string())
            })
            .transpose(),
        );
    });
    receive.await.map_err(|e| e.to_string())?
}

#[tauri::command]
fn create_project_directory(
    parent: String,
    name: String,
    mode: tauri::State<'_, DesktopMode>,
) -> Result<String, String> {
    require_editor(&mode)?;
    let parent = canonical_directory(&parent)?;
    let name = name.trim();
    let reserved = [
        "con", "prn", "aux", "nul", "com1", "com2", "com3", "com4", "com5", "com6", "com7", "com8",
        "com9", "lpt1", "lpt2", "lpt3", "lpt4", "lpt5", "lpt6", "lpt7", "lpt8", "lpt9",
    ];
    if name.is_empty()
        || name == "."
        || name == ".."
        || name.ends_with('.')
        || name.ends_with(' ')
        || name
            .chars()
            .any(|value| value.is_control() || "\\/:*?\"<>|".contains(value))
        || reserved
            .iter()
            .any(|value| name.eq_ignore_ascii_case(value))
    {
        return Err("Nome de projeto inválido para uma pasta do Windows.".into());
    }
    let target = parent.join(name);
    fs::create_dir(&target).map_err(|e| format!("Não foi possível criar a pasta: {e}"))?;
    fs::canonicalize(target)
        .map(|path| path.to_string_lossy().into_owned())
        .map_err(|e| e.to_string())
}

fn collect_resource_files(
    root: &Path,
    current: &Path,
    out: &mut Vec<ProjectFile>,
) -> Result<(), String> {
    for entry in fs::read_dir(current).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let kind = entry.file_type().map_err(|e| e.to_string())?;
        if kind.is_symlink() {
            continue;
        }
        if kind.is_dir() {
            collect_resource_files(root, &entry.path(), out)?;
            continue;
        }
        if !kind.is_file() {
            continue;
        }
        let relative = entry
            .path()
            .strip_prefix(root)
            .map_err(|e| e.to_string())?
            .to_string_lossy()
            .replace('\\', "/");
        let bytes = fs::read(entry.path()).map_err(|e| e.to_string())?;
        out.push(ProjectFile {
            path: relative,
            content: encode_base64(&bytes),
        });
    }
    Ok(())
}

#[tauri::command]
fn read_app_resources(app: tauri::AppHandle) -> Result<Vec<ProjectFile>, String> {
    let manifest = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let bundled = app.path().resource_dir().ok();
    let runtime = bundled
        .as_ref()
        .map(|dir| dir.join("runtime"))
        .filter(|dir| dir.is_dir())
        .unwrap_or_else(|| {
            manifest
                .join("..")
                .join("build")
                .join("diana")
                .join("runtime")
        });
    if !runtime.join("reactor_main.js").is_file() {
        return Err(
            "Runtime do jogo não encontrado. Prepare a aplicação antes de iniciar o Tauri.".into(),
        );
    }
    let mut files = Vec::new();
    collect_resource_files(&runtime, &runtime, &mut files)?;
    let app_root = bundled
        .filter(|dir| dir.join("LICENSE").is_file() || dir.join("THIRD_PARTY_NOTICES.md").is_file())
        .unwrap_or_else(|| manifest.join(".."));
    for name in ["LICENSE", "THIRD_PARTY_NOTICES.md"] {
        let path = app_root.join(name);
        if path.is_file() {
            files.push(ProjectFile {
                path: name.into(),
                content: encode_base64(&fs::read(path).map_err(|e| e.to_string())?),
            });
        }
    }
    for file in &mut files {
        if !["LICENSE", "THIRD_PARTY_NOTICES.md"].contains(&file.path.as_str()) {
            file.path = format!("runtime/{}", file.path);
        }
    }
    Ok(files)
}

#[tauri::command]
fn read_project_files(
    path: String,
    mode: tauri::State<'_, DesktopMode>,
) -> Result<Vec<String>, String> {
    require_editor(&mode)?;
    let root = canonical_directory(&path)?;
    if !root.join("project.rpgreactor").is_file()
        && !root.join("game.rmmzproject").is_file()
        && !root.join("Game.rpgproject").is_file()
        && !root.join("game.rpgproject").is_file()
    {
        return Err("A pasta não contém um projeto Luae RPG ou RPG Maker compatível.".into());
    }
    let mut files = Vec::new();
    let mut total = 0;
    collect_files(&root, &root, &mut files, &mut total)?;
    files.sort();
    Ok(files)
}

// The starter packs already belong to frontendDist. Read the embedded assets
// only when creating a project, without bundling a second physical copy or
// requiring the development checkout on an installed application.
#[tauri::command]
fn read_starter_resources(
    app: tauri::AppHandle,
    mode: tauri::State<'_, DesktopMode>,
) -> Result<Vec<ProjectFile>, String> {
    require_editor(&mode)?;
    let resolver = app.asset_resolver();
    let mut files = Vec::new();
    for (name, bytes) in resolver.iter() {
        let relative = name.trim_start_matches('/');
        if relative.starts_with("diana-assets/") {
            files.push(ProjectFile {
                path: format!("editor/{relative}"),
                content: encode_base64(bytes.as_ref()),
            });
        }
    }
    if !files
        .iter()
        .any(|file| file.path == "editor/diana-assets/jrpg-test/manifest.json")
    {
        return Err("Os recursos da Clareira não foram incluídos na aplicação. Prepare e compile o editor novamente.".into());
    }
    Ok(files)
}

#[tauri::command]
fn read_project_file(
    path: String,
    relative: String,
    mode: tauri::State<'_, DesktopMode>,
) -> Result<String, String> {
    require_editor(&mode)?;
    let root = canonical_directory(&path)?;
    let relative = safe_relative(&relative)?;
    let target = root.join(relative);
    let canonical = fs::canonicalize(&target)
        .map_err(|e| format!("Não foi possível ler arquivo do projeto: {e}"))?;
    if !canonical.starts_with(&root) || !canonical.is_file() {
        return Err("Arquivo do projeto inválido.".into());
    }
    let metadata = fs::metadata(&canonical).map_err(|e| e.to_string())?;
    if metadata.len() > 128 * 1024 * 1024 {
        return Err("Arquivo individual acima do limite de 128 MiB.".into());
    }
    let bytes = fs::read(&canonical)
        .map_err(|e| format!("Não foi possível ler arquivo do projeto: {e}"))?;
    Ok(encode_base64(&bytes))
}

fn safe_relative(path: &str) -> Result<PathBuf, String> {
    let candidate = Path::new(path);
    if candidate.as_os_str().is_empty()
        || candidate.is_absolute()
        || candidate
            .components()
            .any(|part| !matches!(part, Component::Normal(_)))
    {
        return Err("O caminho de arquivo do projeto é inválido.".into());
    }
    Ok(candidate.to_path_buf())
}

#[tauri::command]
fn save_project_changes(
    path: String,
    files: Vec<ProjectFile>,
    deleted: Vec<String>,
    mode: tauri::State<'_, DesktopMode>,
) -> Result<(), String> {
    require_editor(&mode)?;
    let root = canonical_directory(&path)?;
    if !root.join("project.rpgreactor").is_file()
        && !files.iter().any(|file| file.path == "project.rpgreactor")
    {
        return Err("O projeto foi removido ou não é mais válido.".into());
    }
    for relative in deleted {
        let relative = safe_relative(&relative)?;
        if relative
            .file_name()
            .is_some_and(|name| name == ".rpgreactor.lock")
        {
            continue;
        }
        let target = root.join(relative);
        if target.exists() && target.is_file() {
            let canonical = fs::canonicalize(&target).map_err(|e| e.to_string())?;
            if !canonical.starts_with(&root) {
                return Err("O caminho de remoção saiu da pasta do projeto.".into());
            }
            fs::remove_file(target).map_err(|e| e.to_string())?;
        }
    }
    for file in files {
        let relative = safe_relative(&file.path)?;
        if relative
            .file_name()
            .is_some_and(|name| name == ".rpgreactor.lock")
        {
            continue;
        }
        let target = root.join(relative);
        let parent = target.parent().ok_or("Caminho do projeto inválido.")?;
        fs::create_dir_all(parent).map_err(|e| format!("Não foi possível criar a pasta: {e}"))?;
        let canonical_parent = fs::canonicalize(parent).map_err(|e| e.to_string())?;
        if !canonical_parent.starts_with(&root) {
            return Err("O caminho de gravação saiu da pasta do projeto.".into());
        }
        let bytes = decode_base64(&file.content)?;
        if bytes.len() > 256 * 1024 * 1024 {
            return Err("Arquivo individual acima do limite de gravação do Tauri.".into());
        }
        let temp = target.with_extension(format!("diana-{}.tmp", std::process::id()));
        fs::write(&temp, bytes)
            .map_err(|e| format!("Não foi possível gravar {}: {e}", target.display()))?;
        // std::fs::rename replaces files on Windows. If replacement fails,
        // preserve the old file and report the failure; never delete it first.
        fs::rename(&temp, &target)
            .map_err(|e| format!("Não foi possível finalizar {}: {e}", target.display()))?;
    }
    Ok(())
}

#[tauri::command]
async fn export_game(
    project_path: String,
    parent_path: String,
    mode: tauri::State<'_, DesktopMode>,
) -> Result<String, String> {
    require_editor(&mode)?;
    let executable = std::env::current_exe().map_err(|e| e.to_string())?;
    tauri::async_runtime::spawn_blocking(move || {
        standalone::export(
            Path::new(&project_path),
            Path::new(&parent_path),
            &executable,
        )
        .map(|path| path.to_string_lossy().into_owned())
    })
    .await
    .map_err(|e| e.to_string())?
}

fn main() {
    let executable = std::env::current_exe().expect("caminho do executável");
    let exported = standalone::detect(&executable).expect("exportação Luae RPG válida");
    let game_root = exported.as_ref().map(|(_, root)| root.clone());
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(PlaytestProject(Mutex::new(game_root)))
        .manage(DesktopMode {
            game: exported.is_some(),
        })
        .setup(move |app| {
            let mut config = app.config().app.windows[0].clone();
            let local = app.path().app_local_data_dir()?;
            let profile = if let Some((manifest, _)) = &exported {
                config.title = manifest.title.clone();
                config.url = tauri::WebviewUrl::External(
                    "http://diana-project.localhost/index.html".parse()?,
                );
                local.join("games").join(&manifest.game_id)
            } else {
                local
            };
            fs::create_dir_all(&profile)?;
            tauri::WebviewWindowBuilder::from_config(app, &config)?
                .data_directory(profile)
                .build()?;
            Ok(())
        })
        .register_asynchronous_uri_scheme_protocol(
            "diana-project",
            |context, request, responder| {
                let app = context.app_handle().clone();
                let method = request.method().as_str().to_owned();
                let path = request.uri().path().to_owned();
                std::thread::spawn(move || {
                    responder.respond(serve_playtest_request(&app, &method, &path))
                });
            },
        )
        .invoke_handler(tauri::generate_handler![
            choose_project_directory,
            create_project_directory,
            read_app_resources,
            read_starter_resources,
            read_project_files,
            read_project_file,
            save_project_changes,
            set_playtest_project,
            export_game
        ])
        .run(tauri::generate_context!())
        .expect("falha ao iniciar Luae RPG Studio");
}

#[cfg(test)]
mod tests {
    use super::{decode_base64, encode_base64, resolve_playtest_file, safe_relative};
    use std::{
        fs,
        path::PathBuf,
        time::{SystemTime, UNIX_EPOCH},
    };

    fn temporary_project() -> PathBuf {
        let nonce = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let path =
            std::env::temp_dir().join(format!("luae-playtest-{}-{nonce}", std::process::id()));
        fs::create_dir_all(&path).unwrap();
        path
    }

    #[test]
    fn base64_round_trips_project_data_and_binary_assets() {
        for bytes in [b"Luae RPG".as_slice(), &[0, 1, 127, 128, 255]] {
            assert_eq!(decode_base64(&encode_base64(bytes)).unwrap(), bytes);
        }
    }

    #[test]
    fn project_paths_reject_absolute_and_parent_segments() {
        assert!(safe_relative("data/Map001.json").is_ok());
        assert!(safe_relative("../outside.json").is_err());
        assert!(safe_relative("C:/outside.json").is_err());
    }

    #[test]
    fn playtest_resolves_project_files_and_decodes_url_paths() {
        let root = temporary_project();
        fs::write(root.join("index.html"), "<html>Clareira</html>").unwrap();
        fs::write(root.join("mapa da vila.json"), "{}").unwrap();
        let canonical = fs::canonicalize(&root).unwrap();
        assert_eq!(
            resolve_playtest_file(&canonical, "/index.html").unwrap(),
            (
                b"<html>Clareira</html>".to_vec(),
                "text/html; charset=utf-8"
            )
        );
        assert_eq!(
            resolve_playtest_file(&canonical, "/mapa%20da%20vila.json").unwrap(),
            (b"{}".to_vec(), "application/json; charset=utf-8")
        );
        assert!(resolve_playtest_file(&canonical, "/%2e%2e/Cargo.toml").is_err());
        fs::remove_dir_all(root).unwrap();
    }
}
