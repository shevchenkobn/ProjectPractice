using UnityEngine;

[CreateAssetMenu(fileName = "New Buidling Info", menuName = "Buidling Info")]
public class BuidlingInfo : ScriptableObject
{
    public string Name;
    public string Description;
    public int Cost;

    public int ZeroUpgradeRent;
    public int FirstUpgradeRent;
    public int SecondUpgradeRent;
    public int ThirdUpgradeRent;
    public int FourthUpgradeRent;
    public int FifthUpgradeRent;

    public int BasicUpgradeCost;
    public int FinalUpgradeCost;

    public int Mortgage;
}
