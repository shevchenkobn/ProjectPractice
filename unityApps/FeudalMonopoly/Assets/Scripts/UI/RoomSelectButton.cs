using UnityEngine;
using UnityEngine.UI;
using System.Collections;

public class RoomSelectButton : MonoBehaviour
{
    public GameObject loadingPanel;
    public Slider loadingSlider;

    public void FindRoom()
    {
        //TODO: workaround
        StartCoroutine(LoadGameScene());        
    }

    private IEnumerator LoadGameScene()
    {
        int nextSceneIndex = LevelLoadHelper.GetNextLevelIndex();
        yield return StartCoroutine(LevelLoadHelper.LoadLevelAsync(nextSceneIndex, loadingPanel, loadingSlider));
    }
}
