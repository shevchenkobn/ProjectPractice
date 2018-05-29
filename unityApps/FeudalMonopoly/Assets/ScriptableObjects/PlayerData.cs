using UnityEngine;

[CreateAssetMenu(fileName = "New Player Data", menuName = "Player Data")]
public class PlayerData : ScriptableObject
{
    public string Login;
    public string Password;

    public int Coins;
    public int Gems;
}
