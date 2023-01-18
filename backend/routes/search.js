"use strict";

const express = require("express");
const router = express.Router();

const { Client } = require("@elastic/elasticsearch");
const client = new Client({ node: "http://localhost:9200" });

var stopwords = require("../../data/stop_words.json");
var stemwords = require("../../data/artist_identiry_words.json");
var named_entities = require("../../data/selected_names.json");

router.post("/", async function (req, res) {
  var query = req.body.query;
  var query_words = query.trim().split(" ");
  var removing_stopwords = [];
  var size = 100;

  var field_type = "cross_fields";

  var writer_boost = 1;
  var artist_boost = 1;
  var song_title_eng_boost = 1;
  var song_title_sin_boost = 1;
  var year_en = 1;
  var year_si = 1;
  var metaphors = 1;
  var metaphors_target = 1;
  var metaphors_meaning = 1;
  var lyrics = 1;

  query_words.forEach((word) => {
    // Check language

    if (/^[A-Za-z0-9/\s/]*$/.test(req.body.query)) {
      console.log(req.body.query);
      // English
      // Increase score based on stopwords

      if (stopwords.songs_eng.includes(word)) {
        song_title_eng_boost += 1;
        removing_stopwords.push(word);
      }

      if (stopwords.year_eng.includes(word)) {
        // 2012 year, in 2012
        year_en += 1;
        removing_stopwords.push(word);
      }

      if (named_entities.year.includes(word)) {
        year_en += 1;
      }
    } else {
      // Sinhala

      // length
      // if (query.trim().length >= 100) { // char count > 100
      //   lyrics += 3;
      //   field_type = "best_fields";
      // }

      // Increase score based on stemwords
      stemwords.artist_sin.forEach((stemword) => {
        if (word.includes(stemword)) {
          var new_word = word.replace(stemword, "");
          query = query.replace(word, new_word);
          artist_boost += 1;
          writer_boost += 1;
        }
      });

      // Increase score based on stopwords
      if (stopwords.artist.includes(word)) {
        artist_boost += 1;
        removing_stopwords.push(word);
      }

      if (stopwords.lyricist.includes(word)) {
        writer_boost += 1;
        removing_stopwords.push(word);
      }

      if (stopwords.songs.includes(word)) {
        song_title_sin_boost += 1;
        removing_stopwords.push(word);
      }

      if (stopwords.year.includes(word)) {
        year_si += 1;
        removing_stopwords.push(word);
      }

      if (stopwords.metaphor.includes(word)) {
        metaphors += 1;
        removing_stopwords.push(word);
      }
      if (stopwords.target_domain.includes(word)) {
        metaphors_meaning += 1;
        metaphors_target += 2;
        removing_stopwords.push(word);
      }

      // Increase score based on named_entities.
      if (named_entities.artist.includes(word)) {
        artist_boost += 1;
      }

      if (named_entities.lyricist.includes(word)) {
        writer_boost += 1;
      }

      if (named_entities.year.includes(word)) {
        year_si += 1;
      }
    }
  });

  removing_stopwords.forEach((word) => {
    query = query.replace(word, "");
  });

  if (typeof String.prototype.replaceAll === "undefined") {
    String.prototype.replaceAll = function (match, replace) {
      return this.replace(new RegExp(match, "g"), () => replace);
    };
  }

  stopwords.common.forEach((word) => {
    query = query.replaceAll(word, "");
  });
  console.log(query.trim());
  if (/^[A-Za-z0-9/\s/]*$/.test(req.body.query)) {
    var result = await client.search({
      index: "sinhala_songs_and_metaphors",
      body: {
        size: size,
        _source: {
          includes: [
            "song_name",
            "song_name_eng",
            "artist",
            "lyrics",
            "lyricist",
            "album",
            "year",
            "metaphors.metaphor",
            "metaphors.target_domain",
            "metaphors.source_domain",
            "metaphors.meaning",
          ],
        },
        query: {
          multi_match: {
            query: query.trim(),
            fields: [
              `song_name_eng^${song_title_eng_boost}`,
              `year^${year_en}`,
            ],
            operator: "and",
            type: field_type,
          },
        },
        aggs: {
          metaphore_filter: {
            terms: {
              field: "metaphors.source_domain.keyword",
              size: 10,
            },
          },
          artist_filter: {
            terms: {
              field: "artist.keyword",
              size: 10,
            },
          },
          writer_filter: {
            terms: {
              field: "lyricist.keyword",
              size: 10,
            },
          },
          year_filter: {
            terms: {
              field: "year.keyword",
              size: 10,
            },
          },
          target_filter: {
            terms: {
              field: "metaphors.target_domain.keyword",
              size: 10,
            },
          },
        },
      },
    });
  } else {
    console.log(query.trim());
    var result = await client.search({
      index: "sinhala_songs_and_metaphors",
      body: {
        size: size,
        _source: {
          includes: [
            "song_name",
            "song_name_eng",
            "artist",
            "lyrics",
            "lyricist",
            "album",
            "year",
            "metaphors.metaphor",
            "metaphors.target_domain",
            "metaphors.source_domain",
            "metaphors.meaning",
          ],
        },
        query: {
          multi_match: {
            query: query.trim(),
            fields: [
              `artist^${artist_boost}`,
              `lyricist^${writer_boost}`,
              `song_name^${song_title_sin_boost}`,
              `year^${year_si}`,
              `lyrics^${lyrics}`,
              `metaphors.metaphor^${metaphors}`,
              `metaphors.source_domain^${metaphors}`,
              `metaphors.target_domain^${metaphors_target}`,
              `metaphors.meaning^${metaphors_meaning - 1}`,
            ],
            operator: "or",
            type: field_type,
          },
        },
        aggs: {
          metaphore_filter: {
            terms: {
              field: "metaphors.source_domain.keyword",
              size: 10,
            },
          },
          artist_filter: {
            terms: {
              field: "artist.keyword",
              size: 10,
            },
          },
          writer_filter: {
            terms: {
              field: "lyricist.keyword",
              size: 10,
            },
          },
          year_filter: {
            terms: {
              field: "year.keyword",
              size: 10,
            },
          },
          target_filter: {
            terms: {
              field: "metaphors.target_domain.keyword",
              size: 10,
            },
          },
        },
      },
    });
  }
  console.log("writer boost", writer_boost);
  console.log("artist boost", artist_boost);
  console.log("song boost", song_title_sin_boost);
  console.log("song_title_eng_boost", song_title_eng_boost);
  console.log("song_title_sin_boost", song_title_sin_boost);
  console.log("year_en", year_en);
  console.log("year_si boost", year_si);
  console.log("metaphors", metaphors);
  console.log("lyrics", lyrics);
  console.log("target", metaphors_target);
  console.log("target", metaphors_meaning);
  res.send({
    aggs: result.body.aggregations,
    hits: result.body.hits.hits,
    res: result,
  });
});

module.exports = router;
