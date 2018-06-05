using UnityEngine;
using UnityEngine.SceneManagement;

class AudioManager : MonoBehaviour
{
    public static AudioManager Instance { get; private set; }

    public AudioClip[] levelMusic;

    private AudioSource audioSource;

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

        audioSource = GetComponent<AudioSource>();

        float volume = PlayerPrefsHelper.GetVolume();
        SetVolume(volume);

        audioSource.PlayOneShot(levelMusic[0]);
    }

    private void OnEnable()
    {
        SceneManager.sceneLoaded += OnLevelLoaded;
    }

    private void OnDisable()
    {
        SceneManager.sceneLoaded -= OnLevelLoaded;
    }

    public void SetVolume(float value)
    {
        audioSource.volume = value;
        PlayerPrefsHelper.SetVolume(value);
    }

    void OnLevelLoaded(Scene scene, LoadSceneMode mode)
    {
        if (scene.buildIndex <= 0) return;

        AudioClip currentClip = levelMusic[scene.buildIndex - 1];

        if (currentClip)
        {
            audioSource.clip = currentClip;
            audioSource.loop = true;
            audioSource.Play();
        }
    }
}

