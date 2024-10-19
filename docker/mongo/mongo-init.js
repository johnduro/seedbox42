db.createUser(
    {
        user: "mongouser",
        pwd: "mongopass",
        roles: [
            {
                role: "readWrite",
                db: "seedapp"
            }
        ]
    }
)
