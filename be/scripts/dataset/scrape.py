import pandas as pd
import tweepy

BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAEp08gEAAAAASHdvIC6kPnJvx89KlnPvBgJL0oU%3DXJl3KMDjXcnAM0UAJorswdC6OPgH2h5Dz5htkF54VOmlvCRlU0"
client = tweepy.Client(bearer_token=BEARER_TOKEN)

query = """
(efisiensi anggaran pendidikan OR
 pemotongan dana pendidikan OR
 "anggaran pendidikan" efisiensi OR
 dana BOS efisiensi OR
 Kemendikbud anggaran)
lang:id -is:retweet
"""

all_tweets = []
paginator = tweepy.Paginator(
    client.search_recent_tweets,
    query=query,
    tweet_fields=["created_at", "author_id"],
    max_results=5,
    limit=1,  # 5 halaman = 500 tweet
)

for tweet in paginator.flatten():
    all_tweets.append(
        {
            "text": tweet.text,
            "created_at": tweet.created_at,
        }
    )

df = pd.DataFrame(all_tweets)
df.to_csv("tweets_pendidikan.csv", index=False, encoding="utf-8-sig")
print(f"✅ {len(df)} tweet tersimpan")
