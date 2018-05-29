using UnityEngine;

public class ChangePanelStateButton : MonoBehaviour
{
    public GameObject panel;

    public void ChangePanelState()
    {
        panel.SetActive(!panel.activeSelf);
    }
}
