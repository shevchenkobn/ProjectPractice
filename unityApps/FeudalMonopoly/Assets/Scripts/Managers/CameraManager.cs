using UnityEngine;
using UnityEngine.UI;

public class CameraManager : MonoBehaviour
{
    public static CameraManager Instance { get; private set; }

    public static event System.Action<BuidlingInfo> BuildingCaptured = delegate { };
    public static event System.Action CameraManagerLoaded = delegate { };

    public Camera ActiveCamera { get; private set; }   

    public Camera mainCamera;
    public Camera topViewCamera;
    public Camera freeCamera;
    public Camera buildingCamera;

    public RawImage buildingCameraImage;

    private BuildingCamera buildingCameraComponent;

    private float distanceToBackground = 100f;
    private int buildingsLayerMask;

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

        Initialize();
    }

    private void Start()
    {
        CameraManagerLoaded();
    }

    private void OnEnable()
    {
        Application.logMessageReceived += OnExceptionReceived;
        Dice.DiceRolling += OnDiceRolling;
        Dice.DiceRolled += OnDiceRolled;
        InputManager.MouseButtonDown += OnMouseButtonDown;
    }

    private void OnDisable()
    {
        Application.logMessageReceived -= OnExceptionReceived;
        Dice.DiceRolling -= OnDiceRolling;
        Dice.DiceRolled -= OnDiceRolled;
        InputManager.MouseButtonDown -= OnMouseButtonDown;
    }

    private void OnExceptionReceived(string condiotion, string message, LogType logType)
    {
        Logger.Log($"Condition: {condiotion}; Messgae: {message}; Type: {logType}.");
    }

    private void OnMouseButtonDown()
    {
        Transform targetBuilding = DetectBuilding();

        if (targetBuilding) ActivateBuildingCamera(targetBuilding);
        else if (UIManager.Instance.buildingInfoPanel.activeSelf) return;
        else DeactivateBuildingCamera();        
    }

    /// <summary>
    /// Sets active camera and setups builidng camera's texture
    /// </summary>
    private void Initialize()
    {
        buildingsLayerMask = LayerMask.GetMask("Buildings");
        SetActiveCamera();
        SetupBuildingCamera();
    }

    /// <summary>
    /// Changes ActiveCamera for topViewCamera
    /// </summary>
    private void OnDiceRolling()
    {
        ActivateTopViewCamera();
    }

    /// <summary>
    /// Changes ActiveCamera for mainCamera
    /// </summary>
    /// <param name="steps">Ignore this value</param>
    private void OnDiceRolled(int steps)
    {
        ActivateMainCamera();
    }

    /// <summary>
    /// Detects active camera and activates it
    /// </summary>
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

    /// <summary>
    /// Makes mainCamera active and disables the others
    /// </summary>
    public void ActivateMainCamera()
    {
        mainCamera.enabled = true;
        topViewCamera.enabled = false;
        freeCamera.enabled = false;

        ActiveCamera = mainCamera;
    }

    /// <summary>
    /// Makes topViewCamera active and disables the others
    /// </summary>
    public void ActivateTopViewCamera()
    {
        mainCamera.enabled = false;
        topViewCamera.enabled = true;
        freeCamera.enabled = false;

        ActiveCamera = topViewCamera;
    }

    /// <summary>
    /// Makes freeCamera active and disables the others
    /// </summary>
    public void ActivateFreeCamera()
    {
        mainCamera.enabled = false;
        topViewCamera.enabled = false;
        freeCamera.enabled = true;

        ActiveCamera = freeCamera;
    }

    /// <summary>
    /// Turns on the building camera
    /// </summary>
    /// <param name="target"></param>
    public void ActivateBuildingCamera(Transform target)
    {
        if (buildingCameraComponent.Target != target)
        {
            buildingCameraComponent.Target = target;
            buildingCamera.enabled = true;
            buildingCameraComponent.OnBuildingCaptured();
        }
    }

    /// <summary>
    /// Turns off the building camera
    /// </summary>
    public void DeactivateBuildingCamera()
    {
        buildingCameraComponent.Target = null;
        buildingCamera.enabled = false;
    }

    /// <summary>
    /// Creates render texture for buildingCamera to render its viewport
    /// </summary>
    private void SetupBuildingCamera()
    {
        buildingCameraComponent = buildingCamera.GetComponent<BuildingCamera>();

        if (buildingCamera.targetTexture) buildingCamera.targetTexture.Release();

        buildingCamera.targetTexture = new RenderTexture(Screen.width, Screen.height, 24);
        buildingCameraImage.texture = buildingCamera.targetTexture;

        DeactivateBuildingCamera();
    }

    /// <summary>
    /// Raycast to the clicked point in the world and checks whether it was a building 
    /// </summary>
    /// <returns>Selected building</returns>
    private Transform DetectBuilding()
    {
        Ray ray = InputManager.Instance.GetInputRay();

        RaycastHit hit;        
        if (Physics.Raycast(ray, out hit, distanceToBackground, buildingsLayerMask))
        {
            Building buildingHit = hit.transform.GetComponent<Building>();
            if (buildingHit) BuildingCaptured(buildingHit.buidlingInfo);

            return hit.transform;           
        }

        return null;
    }
}