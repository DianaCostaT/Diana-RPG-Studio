using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

internal static class DianaLauncher
{
    [STAThread]
    private static int Main()
    {
        try
        {
            string root = AppDomain.CurrentDomain.BaseDirectory;
            string editor = Path.Combine(root, "app", "editor");
            string runtime = Path.Combine(root, "nw.exe");
            if (!File.Exists(runtime) || !File.Exists(Path.Combine(editor, "index.html")))
                throw new IOException("A pasta do Diana está incompleta. Mantenha Diana.exe junto de nw.exe e da pasta app.");
            Process.Start(new ProcessStartInfo {
                FileName = runtime,
                Arguments = "--user-data-dir=\"" + Path.Combine(root, "profile") + "\" \"" + editor + "\"",
                WorkingDirectory = editor,
                UseShellExecute = false,
                CreateNoWindow = true
            });
            return 0;
        }
        catch (Exception error)
        {
            MessageBox.Show(error.Message, "Não foi possível iniciar o Diana", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }
    }
}
