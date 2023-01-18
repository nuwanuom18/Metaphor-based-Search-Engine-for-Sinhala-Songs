"use strict";

require("array.prototype.flatmap").shim();
const { Client } = require("@elastic/elasticsearch");
const client = new Client({
  node: "http://localhost:9200",
});

const prettifiedData = require("../data/sinhala_songs_corpus.json");

async function run() {
  await client.indices.create(
    {
      index: "sinhala_songs_and_metaphors",
      body: {
        settings: {
          analysis: {
            analyzer: {
              my_analyzer: {
                type: "custom",
                tokenizer: "icu_tokenizer",
                filter: ["customNgramFilter", "customStopWordFilter"],
              },
            },
            filter: {
              customNgramFilter: {
                type: "edge_ngram",
                min_gram: "4",
                max_gram: "18",
                side: "front",
              },
              customStopWordFilter: {
                type: "stop",
                ignore_case: true,
                stopwords: [
                  "ගායනා",
                  "ගායනා",
                  "ගැයු",
                  "ගයන",
                  "කිව්",
                  "කිවු",
                  "ලියන",
                  "රචිත",
                  "ලියපු",
                  "ලියව්‌ව",
                  "ගත්කරු",
                  "රචකයා",
                  "ගීත",
                  "සිංදු",
                  "ගී",
                  "සින්දු",
                  "ලියන්නා",
                  "ගායකයා",
                  "ගයනවා",
                  "රචනා",
                  "වර්‍ගයේ",
                  "වර්ගයේම",
                  "වර්ගයේ",
                  "වැනි",
                  "ඇතුලත්",
                  "ඇතුලු",
                  "විදියේ",
                  "රචක",
                  "ලියන්",
                  "ලිවූ",

                  "සංගීත",
                  "සංගීතවත්",
                  "සංගීතය",
                  "වර්ගය",

                  "විදිහේ",
                ],
              },
            },
          },
        },
        mappings: {
          properties: {
            song_name: {
              type: "text",
              fields: {
                raw: {
                  type: "keyword",
                },
              },
              analyzer: "my_analyzer",
            },

            song_name_eng: {
              type: "text",
              analyzer: "plain",
              fields: {
                case_insensitive: {
                  type: "text",
                  analyzer: "case_insensitive",
                },
                inflections: {
                  type: "text",
                  analyzer: "inflections",
                },
                case_insensitive_and_inflections: {
                  type: "text",
                  analyzer: "case_insensitive_and_inflections",
                },
              },
            },

            artist: {
              type: "text",
              fields: {
                raw: {
                  type: "keyword",
                },
              },
              analyzer: "my_analyzer",
            },

            lyricist: {
              type: "text",
              fields: {
                raw: {
                  type: "keyword",
                },
              },
              analyzer: "my_analyzer",
            },

            lyrics: { type: "text" },

            album: {
              type: "text",
              analyzer: "my_analyzer",
            },

            metaphors: {
              type: "nested",
              include_in_root: true,
              properties: {
                metaphor: {
                  type: "text",
                  analyzer: "my_analyzer",
                },
                meaning: {
                  type: "text",
                  analyzer: "my_analyzer",
                },
                meaning_eng: {
                  type: "text",
                  analyzer: "my_analyzer",
                },
                source_domain: {
                  type: "text",
                  fields: {
                    raw: {
                      type: "keyword",
                    },
                  },
                  analyzer: "my_analyzer",
                },
                target_domain: {
                  type: "text",
                  fields: {
                    raw: {
                      type: "keyword",
                    },
                  },
                  analyzer: "my_analyzer",
                },
                target_domain_eng: {
                  type: "text",
                  analyzer: "plain",
                  fields: {
                    case_insensitive: {
                      type: "text",
                      analyzer: "case_insensitive",
                    },
                    inflections: {
                      type: "text",
                      analyzer: "inflections",
                    },
                    case_insensitive_and_inflections: {
                      type: "text",
                      analyzer: "case_insensitive_and_inflections",
                    },
                  },
                },
              },
            },
            year: {
              type: "text",
              fields: {
                raw: {
                  type: "long",
                },
              },
            },
          },
        },
      },
    },
    { ignore: [400] }
  );

  const dataset = prettifiedData;

  const body = dataset.flatMap((doc) => [
    { index: { _index: "sinhala_songs_and_metaphors" } },
    doc,
  ]);

  const { body: bulkResponse } = await client.bulk({ refresh: true, body });

  if (bulkResponse.errors) {
    const erroredDocuments = [];
    bulkResponse.items.forEach((action, i) => {
      const operation = Object.keys(action)[0];
      if (action[operation].error) {
        erroredDocuments.push({
          status: action[operation].status,
          error: action[operation].error,
          operation: body[i * 2],
          document: body[i * 2 + 1],
        });
      }
    });
    console.log(erroredDocuments);
  }

  const { body: count } = await client.count({
    index: "sinhala_songs_and_metaphors",
  });
  console.log(count);
}

run().catch(console.log);
