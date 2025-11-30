export default {
	admin: function (req, res, next) {
		if (req.user.role === 'admin')
			next();
		else
			res.json({ success: false, message: "You don't have enought rights for this action" });
	},

	adminOrUserParam: function (req, res, next) {
		if (req.user.role == 'admin' || req.user._id == req.params.id)
			next();
		else
			res.json({ success: false, message: "You don't have enought rights for this action" });
	}
};
