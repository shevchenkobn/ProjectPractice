using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class MainSceneLoader : MonoBehaviour
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
    public void LoadMainScene()
    {
        GetPlayerData();
        StartCoroutine(WaitForAnimationAndLoadNextScene());
    }

    /// <summary>
    /// Waits until animation ends, switches panels and loads next scene asynchronously
    /// </summary>
    /// <returns></returns>
    private IEnumerator WaitForAnimationAndLoadNextScene()
    {
        // waits for end of animation
        yield return new WaitForSeconds(loginPanelCloseAnimation.length);

        // switches panels
        loginPanel.gameObject.SetActive(false);

        //loads next scene
        int nextSceneIndex = LevelLoadHelper.GetNextLevelIndex();
        yield return StartCoroutine(LevelLoadHelper.LoadLevelAsync(nextSceneIndex, loadingPanel, loadingSlider));
    }

    /// <summary>
    /// Gets player data from input fields
    /// </summary>
    private void GetPlayerData()
    {
        playerData.Login = loginPanel.loginField.text;
        playerData.Password = loginPanel.passwordField.text;
    }
}
