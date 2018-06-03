using UnityEngine;
using UnityEngine.UI;
using System.IO;

public class UIManager : MonoBehaviour
{
    public static UIManager Instance { get; private set; }

    public GameObject buildingInfoPanel;
    public Image titlePanel;

    public Text buildingTitleText;
    public Text buildingDesciptionText;
    public Text buildingCostText;

    public Text buildingZeroRentText;
    public Text buildingFirstRentText;
    public Text buildingSecondRentText;
    public Text buildingThirdRentText;
    public Text buildingFourthRentText;
    public Text buildingFifthRentText;

    public Text buildingBasicUpgradeCostText;
    public Text buildingFinalUpgradeCostText;
    public Text buildingMortgageText;

    /// <summary>
    /// Makes sure that Instance references only to one object in the scene
    /// </summary>
    void Awake()
    {
        if (!Instance)
        {
            Instance = this;
        }
        else
        {
            Destroy(gameObject);
        }        
    }

    private void OnEnable()
    {
        CameraManager.BuildingCaptured += OnBuildingCaptuted;
    }

    private void OnDisable()
    {
        CameraManager.BuildingCaptured -= OnBuildingCaptuted;
    }

    public void OnBuildingCaptuted(BuidlingInfo buildingInfo)
    {
        ShowBuidlingInfo(buildingInfo);
    }

    private void ShowBuidlingInfo(BuidlingInfo buildingInfo)
    {
        titlePanel.color = buildingInfo.Color;

        buildingTitleText.text = buildingInfo.Name;
        buildingDesciptionText.text = buildingInfo.Description;

        buildingCostText.text = buildingInfo.Cost.ToString();
        buildingZeroRentText.text = buildingInfo.ZeroUpgradeRent.ToString();
        buildingFirstRentText.text = buildingInfo.FirstUpgradeRent.ToString();
        buildingSecondRentText.text = buildingInfo.SecondUpgradeRent.ToString();
        buildingThirdRentText.text = buildingInfo.ThirdUpgradeRent.ToString();
        buildingFourthRentText.text = buildingInfo.FourthUpgradeRent.ToString();
        buildingFifthRentText.text = buildingInfo.FifthUpgradeRent.ToString();

        buildingBasicUpgradeCostText.text = buildingInfo.BasicUpgradeCost.ToString();
        buildingFinalUpgradeCostText.text = buildingInfo.FinalUpgradeCost.ToString();
        buildingMortgageText.text = buildingInfo.Mortgage.ToString();

        buildingInfoPanel.SetActive(true);
    }

    public void CloseBuildingInfoPanel()
    {
        buildingInfoPanel.SetActive(false);
        CameraManager.Instance.DeactivateBuildingCamera();
    }
}
