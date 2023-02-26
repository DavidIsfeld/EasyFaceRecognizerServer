const handleRegister = (db, bcrypt) => (req, res) => {
    const {email, name, password} = req.body;

    if (!email || !name || !password) {
        return res.status(400).json('incorrect form submission');
    }

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            db.transaction(trx => {
                trx.insert({
                    hash: hash,
                    email: email
                })
                .into('login')
                .returning('email')
                .then(loginEmail => {
                    trx('users')
                        .returning('*')
                        .insert({
                            name: name,
                            email: loginEmail[0].email,
                            joined: new Date()
                        })
                        .then(user => {
                            res.json(user[0]);
                        });
                })
                .then(trx.commit)
                .catch(trx.rollback);
            }).catch(rError => res.status(400).json('unable to register'));
        });
    });
};

module.exports = {
    handleRegister: handleRegister
}