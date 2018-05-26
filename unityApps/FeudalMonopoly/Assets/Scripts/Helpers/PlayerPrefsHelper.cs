using UnityEngine;

public class PlayerPrefsHelper : MonoBehaviour
{
    const string TOKEN_KEY = "token";

    public static void SetToken(string token)
    {
        PlayerPrefs.SetString(TOKEN_KEY, token);       
    }

    public static string GetToken()
    {
        return PlayerPrefs.GetString(TOKEN_KEY);
    }
}
