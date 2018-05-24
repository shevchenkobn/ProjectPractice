using System;
using UnityEngine;

public class CameraManager : MonoBehaviour
{
    public static CameraManager Instance { get; private set; }

    public Camera ActiveCamera { get; private set; }   

    public Camera mainCamera;
    public Camera topViewCamera;
    public Camera freeCamera;
    public Camera buildingCamera;

    public Material renderTextureMaterial;

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

    private void Start()
    {
        SetActiveCamera();
        SetupBuildingCamera();
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
        ActivateTopViewCamera();
    }

    private void OnDiceRolled(int steps)
    {
        ActivateMainCamera();
    }

    private void SetActiveCamera()
    {
        if (mainCamera.enabled)
        {
            ActiveCamera = mainCamera;
        }
        else if (topViewCamera.enabled)
        {
            ActiveCamera = topViewCamera;
        }
        else
        {
            ActiveCamera = freeCamera;
        }
    }

    public void ActivateMainCamera()
    {
        mainCamera.enabled = true;
        topViewCamera.enabled = false;
        freeCamera.enabled = false;

        ActiveCamera = mainCamera;
    }

    public void ActivateTopViewCamera()
    {
        mainCamera.enabled = false;
        topViewCamera.enabled = true;
        freeCamera.enabled = false;

        ActiveCamera = topViewCamera;
    }

    public void ActivateFreeCamera()
    {
        mainCamera.enabled = false;
        topViewCamera.enabled = false;
        freeCamera.enabled = true;

        ActiveCamera = freeCamera;
    }

    public void ActivateBuildingCamera()
    {
        buildingCamera.enabled = true;
    }

    public void DeactivateBuildingCamera()
    {
        buildingCamera.enabled = false;
    }

    private void SetupBuildingCamera()
    {
        if (buildingCamera.targetTexture) buildingCamera.targetTexture.Release();

        buildingCamera.targetTexture = new RenderTexture(Screen.width, Screen.height, 24);
        renderTextureMaterial.mainTexture = buildingCamera.targetTexture;
    }
}
