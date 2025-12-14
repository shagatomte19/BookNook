"""
Utility for generating random nicknames.
"""
import random

ADJECTIVES = [
    "Happy", "Lucky", "Sunny", "Clever", "Brave", "Calm", "Gentle", "Jolly", "Kind", "Lively",
    "Nice", "Proud", "Silly", "Witty", "Zesty", "Bright", "Cool", "Dandy", "Fancy", "Great",
    "Bookish", "Nerdy", "Smart", "Wise", "Quick", "Eager", "Fair", "Good", "Keen", "Neat"
]

NOUNS = [
    "Reader", "Writer", "Bookworm", "Scholar", "Poet", "Scribe", "Bard", "Critic", "Fan", "Geek",
    "Hero", "Icon", "Joker", "King", "Lion", "Monk", "Ninja", "Owl", "Pilot", "Queen",
    "Ranger", "Star", "Tiger", "User", "Viper", "Walker", "Yogi", "Zebra", "Page", "Story"
]

def generate_random_nickname() -> str:
    """Generate a random nickname like 'HappyReader123'."""
    adj = random.choice(ADJECTIVES)
    noun = random.choice(NOUNS)
    num = random.randint(100, 999)
    return f"{adj}{noun}{num}"
