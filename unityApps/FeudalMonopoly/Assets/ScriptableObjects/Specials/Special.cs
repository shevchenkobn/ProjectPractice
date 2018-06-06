using UnityEngine;

[CreateAssetMenu(fileName = "New Special", menuName = "Special")]
public class Special : ScriptableObject
{
    public Color Color;

    public string Type;
    public string Title;
    public string Description;
}
