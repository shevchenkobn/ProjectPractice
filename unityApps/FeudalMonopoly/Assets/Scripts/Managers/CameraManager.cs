using UnityEngine;

public class CameraManager : MonoBehaviour
{
    public static CameraManager Instance { get; private set; }

    public Camera mainCamera;
    public Camera topViewCamera;
    public Camera freeCamera;

    /// <summary>
    /// Makes sure that Instance references only to one object in the scene
    /// </summary>
    void Awake()
    {
        if (!Instance)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }

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

    private void OnDiceRolling()
    {
        ActivteTopViewCamera();
    }

    private void OnDiceRolled(int steps)
    {
        ActivteMainCamera();
    }

    public void ActivteMainCamera()
    {
        mainCamera.enabled = true;
        topViewCamera.enabled = false;
        freeCamera.enabled = false;
    }

    public void ActivteTopViewCamera()
    {
        mainCamera.enabled = false;
        topViewCamera.enabled = true;
        freeCamera.enabled = false;
    }

    public void ActivteFreeCamera()
    {
        mainCamera.enabled = false;
        topViewCamera.enabled = false;
        freeCamera.enabled = true;
    }

}
