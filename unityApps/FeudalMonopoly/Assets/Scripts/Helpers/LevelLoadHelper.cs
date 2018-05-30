using UnityEngine.SceneManagement;
using UnityEngine;
using UnityEngine.UI;
using System.Collections;

public static class LevelLoadHelper
{
    const float MAX_LOADING_PROGRESS_VALUE = 0.9f;

    public static int GetNextLevelIndex()
    {
        return SceneManager.GetActiveScene().buildIndex + 1;
    }

    public static void LoadLevel(int levelIndex)
    {
        SceneManager.LoadScene(levelIndex);
    }

    public static void LoadNextLevel()
    {
        SceneManager.LoadScene(GetNextLevelIndex());
    }

    public static void LoadPreviousLevel()
    {
        int currentLevelIndex = SceneManager.GetActiveScene().buildIndex;
        SceneManager.LoadScene(currentLevelIndex - 1);
    }

    /// <summary>
    /// Loads scence asynchronously
    /// </summary>
    /// <param name="sceneIndex">Index of scene to load</param>
    /// <returns></returns>
    public static IEnumerator LoadLevelAsync(int sceneIndex, GameObject loadingPanel, Slider loadingSlider)
    {
        // activates loading panel
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
}
