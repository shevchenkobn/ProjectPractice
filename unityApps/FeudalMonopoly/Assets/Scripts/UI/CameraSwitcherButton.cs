using UnityEngine;

public class CameraSwitcherButton : MonoBehaviour
{
    public GameObject lockImage;

    private void OnEnable()
    {
        Dice.DiceRolled += OnDiceRolled;
    }

    private void OnDisable()
    {
        Dice.DiceRolled -= OnDiceRolled;
    }

    private void Start()
    {
        if (CameraManager.Instance.ActiveCamera.Equals(CameraManager.Instance.freeCamera))
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
        lockImage.SetActive(true);        
    }
}
