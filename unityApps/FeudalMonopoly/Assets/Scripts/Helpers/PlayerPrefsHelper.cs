using UnityEngine;

public class PlayerPrefsHelper : MonoBehaviour
{
    const string TOKEN_KEY = "token";
    const string VOLUME_KEY = "volume";

    public static void SetToken(string token)
    {
        PlayerPrefs.SetString(TOKEN_KEY, token);       
    }

    public static string GetToken()
    {
        return PlayerPrefs.GetString(TOKEN_KEY);
    }

    public static void SetVolume(float value)
    {
        if (value >= 0 && value <= 1f)
        {
            PlayerPrefs.SetFloat(VOLUME_KEY, value);
        }
        else
        {
            Debug.LogError("Volume value is out of range");
        }
    }

    public static float GetVolume()
    {
        return PlayerPrefs.GetFloat(VOLUME_KEY);
    }
}
