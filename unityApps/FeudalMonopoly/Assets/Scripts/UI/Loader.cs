using System.Collections;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class Loader : MonoBehaviour
{  
    const float MAX_LOADING_PROGRESS_VALUE = 0.9f;

    public PlayerData playerData;
    public LoginPanel loginPanel;
    public GameObject loadingPanel;
    public Slider loadingSlider;

    public AnimationClip loginPanelCloseAnimation;

    /// <summary>
    /// Loads scence asynchronously
    /// </summary>
    /// <param name="sceneIndex">Index of scene to load</param>
    public void LoadLevel(int sceneIndex)
    {
        GetPlayerData();
        StartCoroutine(LoadLevelAsync(sceneIndex));
    }

    /// <summary>
    /// Waits until animation ends, switches panels and loads scence asynchronously
    /// </summary>
    /// <param name="sceneIndex">Index of scene to load</param>
    /// <returns></returns>
    private IEnumerator LoadLevelAsync(int sceneIndex)
    {
        // waits for end of animation
        yield return new WaitForSeconds(loginPanelCloseAnimation.length);

        // switches panels
        loginPanel.gameObject.SetActive(false);
        loadingPanel.SetActive(true);

        // loads next scene
        var operation = SceneManager.LoadSceneAsync(sceneIndex);

        // changes slider value
        while (!operation.isDone)
        {
            float progress = Mathf.Clamp01(operation.progress / MAX_LOADING_PROGRESS_VALUE);
            loadingSlider.value = progress;

            yield return null;
        }
    }

    private void GetPlayerData()
    {
        playerData.Login = loginPanel.loginField.text;
        playerData.Password = loginPanel.passwordField.text;
    }
}
