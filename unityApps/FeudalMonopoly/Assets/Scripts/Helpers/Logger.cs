using UnityEngine;
using System.IO;


public static class Logger
{
    private static string path = Path.Combine(Application.persistentDataPath, "logs.txt");


    public static void Log(string message)
    {
        message = message + System.Environment.NewLine;

        if (!File.Exists(path))
        {            
            File.WriteAllText(path, message);
        }

        File.AppendAllText(path, message);
    }
}

