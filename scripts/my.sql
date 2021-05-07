# For each member that signed up.
CREATE TABLE `members` (
    `id`        INT(11)      NOT NULL AUTO_INCREMENT
  , `username`  VARCHAR(16)  NOT NULL
  , `password`  VARCHAR(256) NOT NULL
  , `playlists` VARCHAR(256) NOT NULL DEFAULT '[]'
  , `score`     INT(10)      NOT NULL DEFAULT '0'
  , PRIMARY KEY (`id`)
) ENGINE = MyISAM;

# Example
# * == unique id
# +---+-----------+-------+---------------+-----+
# | id|  username | pass  |   playlists   |score|
# +---+-----------+-------+---------------+-----+
# | 0 |  Its_its  |   *   |   [ *, * ]    | 0   |
# | 1 | equaviruz |   *   |   [ *, * ]    | -20 |
# +---+-----------+-------+---------------+-----+


# New Database
# Each table playlist is unique to the person.
CREATE TABLE `unique_ID` (
    `id`      VARCHAR(16)  NOT NULL
  , `name`    VARCHAR(32)  NOT NULL
  , `artist`  VARCHAR(32)  NOT NULL
  , `length`  VARCHAR(32)  NOT NULL
  , PRIMARY KEY(`id`)
) ENGINE = MyISAM;
1790407289
