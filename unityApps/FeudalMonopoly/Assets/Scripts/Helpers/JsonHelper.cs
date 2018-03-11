using System.IO;
using Newtonsoft.Json;

public class JsonHelper
{
    /// <summary>
    /// Saves objectToSerialize into the file placed in path
    /// </summary>
    /// <typeparam name="T">Type of object to serialize</typeparam>
    /// <param name="path">Directory where the file stored</param>
    /// <param name="objectToSerialize">Object to serialize</param>
    public static void SaveJson<T>(string path, ref T objectToSerialize)
    {
        using (StreamWriter streamWriter = new StreamWriter(path))
        {

            string json = JsonConvert.SerializeObject(objectToSerialize);
            streamWriter.Write(json);
        }
    }

    /// <summary>
    /// Loads objectToDeserialize from the file placed in path
    /// </summary>
    /// <typeparam name="T">Type of object to deserialize</typeparam>
    /// <param name="path">Directory where the file stored</param>
    /// <param name="objectToDeserialize">Object to deserialize</param>
    public static void LoadJson<T>(string path, ref T objectToDeserialize)
    {
        using (StreamReader streamReader = new StreamReader(path))
        {
            string json = streamReader.ReadToEnd();
            objectToDeserialize = JsonConvert.DeserializeObject<T>(json);
        }
    }
}
