using UnityEngine.SceneManagement;

public static class LevelLoadHelper
{
    public static void LoadLevel(int levelIndex)
    {
        SceneManager.LoadScene(levelIndex);
    }

    public static void LoadNextLevel()
    {
        int currentLevelIndex = SceneManager.GetActiveScene().buildIndex;
        SceneManager.LoadScene(currentLevelIndex + 1);
    }

    public static void LoadPreviousLevel()
    {
        int currentLevelIndex = SceneManager.GetActiveScene().buildIndex;
        SceneManager.LoadScene(currentLevelIndex - 1);
    }
}
