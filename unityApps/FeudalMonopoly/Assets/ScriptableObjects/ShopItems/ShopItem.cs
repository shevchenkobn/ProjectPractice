using UnityEngine;

[CreateAssetMenu(fileName = "New Shop Item", menuName = "Shop Item")]
public class ShopItem : ScriptableObject
{
    public string title;

    public Sprite sprite;

    public int coinsCost;
    public int gemsCost;
}
