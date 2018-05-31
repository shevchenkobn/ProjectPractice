using UnityEngine;

[RequireComponent(typeof(GameManager))]
[RequireComponent(typeof(CameraManager))]
[RequireComponent(typeof(UIManager))]
[RequireComponent(typeof(InputManager))]
public class SupervisorManager : MonoBehaviour
{
    public static SupervisorManager Instance { get; private set; }

    public UIManager UIManager { get; private set; }
    public GameManager GameManager { get; private set; }
    public CameraManager CameraManager { get; private set; }
    public InputManager InputManager { get; private set; }

    private void Awake()
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

    /// <summary>
    /// Gets all references to managers
    /// </summary>
    private void Initialize()
    {
        Instance.UIManager = UIManager.Instance;
        Instance.GameManager = GameManager.Instance;
        Instance.CameraManager = CameraManager.Instance;
        Instance.InputManager = InputManager.Instance;
    }
}
