var LocalStrategy 	= require('passport-local').Strategy;
var mysql 			= require('mysql');
var bcrypt 			= require('bcrypt-nodejs');
var dbconfig 		= require('./database').users;
var connection;

function handleDisconnect() {
	connection = mysql.createConnection(dbconfig.connection);

	connection.connect(function(err) {
		if(err) setTimeout(handleDisconnect, 2000);
	});

	connection.on('error', function(err) {
		if(err.code === 'PROTOCOL_CONNECTION_LOST') {
			handleDisconnect();
		} else {
			throw err;
		}
	});

	connection.query('USE ' + dbconfig.database);
}

handleDisconnect();

module.exports = function(passport, core) {
	//Login
    passport.serializeUser(function(user, done) {
		core.accounts.addFromDatabase(user);
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM " + dbconfig.users_table + " WHERE id = ? ", [ id ], function(err, rows) {
            done(err, rows[0]);
        });
    });

    passport.use(
        'local-signup',
        new LocalStrategy({
              usernameField 	: 'username'
			, passwordField 	: 'password'
			, passReqToCallback : true
        },
        function(req, username, password, done) {
            connection.query("SELECT * FROM " + dbconfig.users_table + " WHERE username = ?", [ username ], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else {
                    var newUserMysql = {
                          username: username
						, password: bcrypt.hashSync(password, null, null)
                    };

                    var insertQuery = "INSERT INTO " + dbconfig.users_table + " ( username, password ) values (?,?)";

                    connection.query(insertQuery, [ newUserMysql.username, newUserMysql.password ], function(err, rows) {
                        newUserMysql.id = rows.insertId;

                        return done(null, newUserMysql);
                    });
                }
            });
        })
    );

    passport.use(
        'local-login',
        new LocalStrategy({
              usernameField 	: 'username'
			, passwordField 	: 'password'
			, passReqToCallback : true
        },
        function(req, username, password, done) {
            connection.query("SELECT * FROM " + dbconfig.users_table + " WHERE username = ?", [ username ], function(err, rows){
                if (err)
					return done(err);
                if (!rows.length)
					return done(null, false, req.flash('loginMessage', 'No user found.'));
                if (!bcrypt.compareSync(password, rows[0].password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                return done(null, rows[0]);
            });
        })
    );
};
