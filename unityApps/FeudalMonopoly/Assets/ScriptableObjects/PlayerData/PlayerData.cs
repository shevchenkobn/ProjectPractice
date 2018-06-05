using UnityEngine;

[CreateAssetMenu(fileName = "New Player Data", menuName = "Player Data")]
public class PlayerData : ScriptableObject
{
    public static event System.Action CoinsValueChanged = delegate { };
    public static event System.Action GemsValueChanged = delegate { };

    public string Login;
    public string Password;

    public int Coins;
    public int Gems;

    public void ChangeCoinsValue(int value)
    {
        Coins += value;
        CoinsValueChanged();
    }

    public void ChangeGemsValue(int value)
    {
        Gems += value;
        GemsValueChanged();
    }
}
