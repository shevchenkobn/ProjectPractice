using UnityEngine;
using UnityEngine.UI;

public class ShopItemDisplay : MonoBehaviour
{
    public ShopItem shopItem;

    public Image image;

    public Text titleText;
    public Text priceText;

    private void Start()
    {
        titleText.text = shopItem.title;
        image.sprite = shopItem.sprite;

        if (shopItem.coinsCost != 0) priceText.text = shopItem.coinsCost.ToString();
        else priceText.text = shopItem.gemsCost.ToString();
    }
}
