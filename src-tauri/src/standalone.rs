//! Local standalone exports reuse the same Tauri host and RPGReactor runtime.
use serde::{Deserialize, Serialize};
use std::{
    fs,
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};

#[derive(Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GameManifest {
    pub schema_version: u32,
    pub game_id: String,
    pub title: String,
    pub host_version: String,
    pub distribution: String,
}

pub fn detect(executable: &Path) -> Result<Option<(GameManifest, PathBuf)>, String> {
    let directory = executable
        .parent()
        .ok_or("Pasta do executável não encontrada.")?;
    let marker = directory.join("luae-export.json");
    if !marker.is_file() {
        return Ok(None);
    }
    let manifest: GameManifest =
        serde_json::from_slice(&fs::read(marker).map_err(|e| e.to_string())?)
            .map_err(|e| format!("Manifesto de jogo inválido: {e}"))?;
    if manifest.schema_version != 1
        || manifest.game_id.is_empty()
        || manifest.game_id.len() > 80
        || !manifest
            .game_id
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '-')
    {
        return Err("Versão ou identificador de exportação inválido.".into());
    }
    let game = fs::canonicalize(directory.join("game"))
        .map_err(|_| "A pasta game da exportação não foi encontrada.")?;
    for file in ["index.html", "data/System.json", "js/reactor_main.js"] {
        let target = fs::canonicalize(game.join(file))
            .map_err(|_| format!("Exportação incompleta: {file}"))?;
        if !target.starts_with(&game) || !target.is_file() {
            return Err("Arquivo de jogo inválido.".into());
        }
    }
    Ok(Some((manifest, game)))
}

fn copy_project(source: &Path, destination: &Path) -> Result<(), String> {
    fs::create_dir_all(destination).map_err(|e| e.to_string())?;
    for entry in fs::read_dir(source).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let name = entry.file_name();
        let text = name.to_string_lossy();
        let kind = entry.file_type().map_err(|e| e.to_string())?;
        if kind.is_symlink() {
            return Err(format!(
                "A exportação não copia links: {}. Use arquivos reais no projeto.",
                entry.path().display()
            ));
        }
        if [
            ".git",
            "node_modules",
            "save",
            "profile",
            ".rpgreactor.lock",
            "debug.log",
        ]
        .contains(&text.as_ref())
        {
            continue;
        }
        if kind.is_dir() {
            copy_project(&entry.path(), &destination.join(name))?;
        } else if kind.is_file() {
            fs::copy(entry.path(), destination.join(name)).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

pub fn export(project: &Path, parent: &Path, executable: &Path) -> Result<PathBuf, String> {
    let project = fs::canonicalize(project).map_err(|e| e.to_string())?;
    let parent = fs::canonicalize(parent).map_err(|e| e.to_string())?;
    if !parent.is_dir() || parent.starts_with(&project) {
        return Err("Escolha uma pasta de exportação fora do projeto.".into());
    }
    for file in [
        "project.rpgreactor",
        "index.html",
        "data/System.json",
        "js/reactor_main.js",
        "LICENSE",
        "THIRD_PARTY_NOTICES.md",
    ] {
        let target = fs::canonicalize(project.join(file))
            .map_err(|_| format!("Projeto incompleto: {file}"))?;
        if !target.starts_with(&project) || !target.is_file() {
            return Err(format!("Arquivo inválido: {file}"));
        }
    }
    let system: serde_json::Value = serde_json::from_slice(
        &fs::read(project.join("data/System.json")).map_err(|e| e.to_string())?,
    )
    .map_err(|e| e.to_string())?;
    let title = system["gameTitle"]
        .as_str()
        .filter(|v| !v.trim().is_empty())
        .unwrap_or("Meu jogo")
        .to_string();
    let stem: String = title
        .chars()
        .filter(|c| !c.is_control() && !"\\/:*?\"<>|".contains(*c))
        .take(64)
        .collect();
    let stem = stem.trim().trim_matches('.');
    let stem = if stem.is_empty() { "Meu jogo" } else { stem };
    let mut index = 1;
    let out = loop {
        let name = if index == 1 {
            format!("{stem} - Luae")
        } else {
            format!("{stem} - Luae {index}")
        };
        let candidate = parent.join(name);
        match fs::create_dir(&candidate) {
            Ok(()) => break candidate,
            Err(e) if e.kind() == std::io::ErrorKind::AlreadyExists => {
                index += 1;
            }
            Err(e) => return Err(format!("Não foi possível criar a exportação: {e}")),
        }
    };
    let result = (|| {
        copy_project(&project, &out.join("game"))?;
        fs::copy(executable, out.join("LuaeGame.exe")).map_err(|e| e.to_string())?;
        let id = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|e| e.to_string())?
            .as_nanos();
        let manifest = GameManifest {
            schema_version: 1,
            game_id: format!("game-{}-{id}", std::process::id()),
            title,
            host_version: env!("CARGO_PKG_VERSION").into(),
            distribution: "local-preview-license-review-required".into(),
        };
        fs::write(out.join("LEIA-ME.txt"),"Execute LuaeGame.exe mantendo a pasta game ao lado. Requer Windows e WebView2.\nExportação local de desenvolvimento; revisão de licenças e notices pendente antes de distribuir.\n").map_err(|e|e.to_string())?;
        // Written last: a partial export must never be recognized as runnable.
        fs::write(
            out.join("luae-export.json"),
            serde_json::to_vec_pretty(&manifest).map_err(|e| e.to_string())?,
        )
        .map_err(|e| e.to_string())?;
        Ok::<(), String>(())
    })();
    result.map_err(|e|format!("Exportação não concluída em {}. Os arquivos parciais foram preservados para inspeção. {e}",out.display()))?;
    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;
    fn fixture() -> PathBuf {
        let n = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let p = std::env::temp_dir().join(format!("luae-export-{}-{n}", std::process::id()));
        fs::create_dir_all(p.join("source/data")).unwrap();
        fs::create_dir_all(p.join("source/js")).unwrap();
        for name in [
            "project.rpgreactor",
            "index.html",
            "LICENSE",
            "THIRD_PARTY_NOTICES.md",
            "js/reactor_main.js",
        ] {
            fs::write(p.join("source").join(name), "fixture").unwrap();
        }
        fs::write(
            p.join("source/data/System.json"),
            r#"{"gameTitle":"Clareira"}"#,
        )
        .unwrap();
        fs::write(p.join("host.exe"), "host fixture").unwrap();
        p
    }
    #[test]
    fn standalone_export_is_self_contained_unique_and_survives_relocation() {
        let root = fixture();
        let out = export(&root.join("source"), &root, &root.join("host.exe")).unwrap();
        let next = export(&root.join("source"), &root, &root.join("host.exe")).unwrap();
        assert_ne!(out, next);
        let game = detect(&out.join("LuaeGame.exe")).unwrap().unwrap();
        assert_eq!(game.0.title, "Clareira");
        fs::rename(&out, root.join("relocated")).unwrap();
        assert!(detect(&root.join("relocated/LuaeGame.exe"))
            .unwrap()
            .is_some());
        assert!(root.join("source/index.html").is_file());
        fs::remove_dir_all(root).unwrap();
    }
    #[test]
    fn exports_reject_project_subdirectories_and_incomplete_sources() {
        let root = fixture();
        assert!(export(
            &root.join("source"),
            &root.join("source"),
            &root.join("host.exe")
        )
        .is_err());
        fs::remove_file(root.join("source/js/reactor_main.js")).unwrap();
        assert!(export(&root.join("source"), &root, &root.join("host.exe")).is_err());
        fs::remove_dir_all(root).unwrap();
    }
    #[test]
    fn invalid_manifest_cannot_escape_the_game_profile() {
        let root = fixture();
        fs::write(root.join("luae-export.json"),r#"{"schemaVersion":1,"gameId":"../escape","title":"bad","hostVersion":"0","distribution":"test"}"#).unwrap();
        assert!(detect(&root.join("host.exe")).is_err());
        fs::remove_dir_all(root).unwrap();
    }
}
