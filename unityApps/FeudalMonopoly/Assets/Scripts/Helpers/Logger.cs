using System.IO;


public static class Logger
{
    public static void Log(string path, string message)
    {
        message = message + System.Environment.NewLine;

        if (!File.Exists(path))
        {
            File.Create(path);
        }

        File.AppendAllText(path, message);        
    }
}

