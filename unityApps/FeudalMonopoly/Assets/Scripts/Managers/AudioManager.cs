using UnityEngine;

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

    public void SetVolume(float value)
    {
        audioSource.volume = value;
        PlayerPrefsHelper.SetVolume(value);
    }

    void OnLevelWasLoaded(int level)
    {
        if (level <= 0) return;

        AudioClip currentClip = levelMusic[level - 1];

        if (currentClip)
        {
            audioSource.clip = currentClip;
            audioSource.loop = true;
            audioSource.Play();
        }
    }
}

