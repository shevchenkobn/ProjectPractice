using UnityEngine;
using System.Collections.Generic;
using System.IO;

public enum GameStatus { Active, Pause, GameOver }

public class GameManager : MonoBehaviour
{
    public static event System.Action GameManagerLoaded = delegate { };

    public static GameManager Instance { get; private set; }

    public GameStatus Status { get; private set; }

    public Player CurrentPlayer
    {
        get
        {
            return players[currentPlayerIndex];
        }
    }

    public Special[] chances;
    public Special[] events;

    public CellBuildingPair[] cellBuildingPairs;

    [System.Serializable]
    public struct CellBuildingPair
    {
        public int cellIndex;
        public Transform transform;
    }

    private const int PLAYER_AMOUNT = 4;

    private Player[] players = new Player[PLAYER_AMOUNT];

    private int currentPlayerIndex = 0;
    private int stepsToMove = 0;

    private bool isRolledTwice = false;

    private List<int> listOfChances = new List<int>() { 3, 5, 13, 19, 34, 37};
    private List<int> listOfEvents = new List<int>() { 8, 24, 39 };

    /// <summary>
    /// Makes sure that Instance references only to one object in the scene
    /// </summary>
    void Awake()
    {
        if (!Instance)
        {
            Instance = this;
        }
        else
        {
            Destroy(gameObject);
        }
    }


    private void Start()
    {
        GameManagerLoaded();

    }

    private void OnEnable()
    {
        Player.PlayerStopped += OnPlayerStopped;
        Application.logMessageReceived += OnExceptionReceived;
        Dice.DiceRolled += OnDiceRolled;
    }

    private void OnDisable()
    {
        Player.PlayerStopped -= OnPlayerStopped;
        Application.logMessageReceived -= OnExceptionReceived;
        Dice.DiceRolled -= OnDiceRolled;
    }

    private void OnExceptionReceived(string condition, string message, LogType logType)
    {
        string path = Path.Combine(Application.persistentDataPath, "/logs.txt");
        Logger.Log(path, $"Condition: {condition}; Messgae: {message}; Type: {logType}.");
    }

    private void OnPlayerStopped(int cellIndex)
    {
        if (listOfChances.Contains(cellIndex))
        {
            Special special = chances[Random.Range(0, chances.Length)];
            UIManager.Instance.ShowSpecialInfo(special);
            return;
        }

        if (listOfEvents.Contains(cellIndex))
        {
            Special special = events[Random.Range(0, events.Length)];
            UIManager.Instance.ShowSpecialInfo(special);
            return;
        }

        for (int i = 0; i < cellBuildingPairs.Length; i++)
        {
            if (cellBuildingPairs[i].cellIndex == cellIndex)
            {
                CameraManager.Instance.ActivateBuildingCamera(cellBuildingPairs[i].transform);
                UIManager.Instance.ShowBuidlingInfo(cellBuildingPairs[i].transform.GetComponent<Building>().buidlingInfo);

                return; 
            }
        }
    }

    /// <summary>
    /// Callback for DiceRolled event, makes player move stepsToMove times after second dice rolled
    /// </summary>
    /// <param name="steps">Amount of steps to move</param>
    private void OnDiceRolled(int steps)
    {
        CurrentPlayer.Move(steps);

        // for two dices

        //stepsToMove += steps;

        //if (!isRolledTwice)
        //{           
        //    isRolledTwice = true;
        //}
        //else
        //{
        //    CurrentPlayer.Move(stepsToMove);

        //    isRolledTwice = false;
        //    stepsToMove = 0;
        //}        
    }

    /// <summary>
    /// Increments currentPlayerIndex and calculates index of next player
    /// </summary>
    public void NextTurn()
    {
        currentPlayerIndex++;
        currentPlayerIndex %= PLAYER_AMOUNT;
    }

    /// <summary>
    /// Registrates player in inner array of players to keep track of current player
    /// </summary>
    /// <param name="player"></param>
    public void Registrate(Player player)
    {
        players[player.Id] = player;
    }
}
