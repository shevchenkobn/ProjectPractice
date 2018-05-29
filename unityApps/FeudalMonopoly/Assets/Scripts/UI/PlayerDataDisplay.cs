using UnityEngine;
using UnityEngine.UI;

public class PlayerDataDisplay : MonoBehaviour
{
    public PlayerData playerData;
    public Text loginText;

    public Text coinsText;
    public Text gemsText;

    private void Start()
    {
        loginText.text += playerData.Login + "!";
        coinsText.text = playerData.Coins.ToString();
        gemsText.text = playerData.Gems.ToString();
    }
}
