using UnityEngine;

public class CameraSwitcherButton : MonoBehaviour
{
    public GameObject lockImage;

    private void OnEnable()
    {
        Dice.DiceRolling += OnDiceRolling;
        Dice.DiceRolled += OnDiceRolled;
    }

    private void OnDisable()
    {
        Dice.DiceRolling -= OnDiceRolling;
        Dice.DiceRolled -= OnDiceRolled;
    }

    private void Start()
    {
        if (CameraManager.Instance.IsFreeCameraActive())
        {
            lockImage.SetActive(false);
        }
    }

    public void SwitchCamera()
    {
        bool isCameraLocked = lockImage.activeSelf;

        if (isCameraLocked) CameraManager.Instance.ActivateFreeCamera();
        else CameraManager.Instance.ActivateMainCamera();

        lockImage.SetActive(!isCameraLocked);        
    }

    public void OnDiceRolled(int steps)
    {
        if (CameraManager.Instance.IsFreeCameraActive())
        {
            lockImage.SetActive(false);
        }
    }

    public void OnDiceRolling()
    {
        lockImage.SetActive(true);        
    }
}
