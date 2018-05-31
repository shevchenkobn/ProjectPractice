using UnityEngine;

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

    private const int PLAYER_AMOUNT = 4;

    private Player[] players = new Player[PLAYER_AMOUNT];

    private int currentPlayerIndex = 0;
    private int stepsToMove = 0;

    private bool isRolledTwice = false;

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
        Dice.DiceRolled += OnDiceRolled;
    }

    private void OnDisable()
    {
        Dice.DiceRolled -= OnDiceRolled;
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
