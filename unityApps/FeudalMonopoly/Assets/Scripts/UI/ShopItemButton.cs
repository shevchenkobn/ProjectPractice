using UnityEngine;

[RequireComponent(typeof(ShopItemDisplay))]
public class ShopItemButton : MonoBehaviour
{
    public PlayerData playerData;

    private ShopItem shopItem;

    private void Start()
    {
        shopItem = GetComponent<ShopItemDisplay>().shopItem;
    }

    public void BuyItem()
    {
        if (shopItem.coinsCost != 0 && playerData.Coins > shopItem.coinsCost)
        {
            playerData.ChangeCoinsValue(-shopItem.coinsCost);
        }
        else if (shopItem.gemsCost != 0 && playerData.Gems > shopItem.gemsCost)
        {
            playerData.ChangeGemsValue(-shopItem.gemsCost);
        }
    }
}
