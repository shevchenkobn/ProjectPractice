using UnityEngine;
using UnityEngine.UI;

public class PlayerDataDisplay : MonoBehaviour
{
    public PlayerData playerData;
    public Text loginText;

    public Text coinsText;
    public Text gemsText;

    private void OnEnable()
    {
        PlayerData.CoinsValueChanged += OnCoinsValueChanged;
        PlayerData.GemsValueChanged += GemsValueChanged;
    }

    private void OnDisable()
    {
        PlayerData.CoinsValueChanged -= OnCoinsValueChanged;
        PlayerData.GemsValueChanged -= GemsValueChanged;
    }

    private void Start()
    {
        loginText.text += playerData.Login + "!";
        DisplayCoins();
        DisplayGems();
    }

    private void OnCoinsValueChanged()
    {
        DisplayCoins();
    }

    private void GemsValueChanged()
    {
        DisplayGems();
    }

    private void DisplayCoins()
    {
        coinsText.text = playerData.Coins.ToString();
    }

    private void DisplayGems()
    {
        gemsText.text = playerData.Gems.ToString();
    }
}
