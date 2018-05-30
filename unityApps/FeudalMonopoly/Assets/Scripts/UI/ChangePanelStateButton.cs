using UnityEngine;

public class ChangePanelStateButton : MonoBehaviour
{
    public GameObject panel;

    /// <summary>
    /// Hides or opens proper panel
    /// </summary>
    public void ChangePanelState()
    {
        panel.SetActive(!panel.activeSelf);
    }
}
