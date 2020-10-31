const getProfile = async (request, response, next) => {
    const { Profile } = request.app.get('models');
    console.log('Profile ID', request.get('profile_id'));
    const profile = await Profile.findOne({ where: { id: request.get('profile_id') || 0 } });
    if (!profile) return response.status(401).end();
    request.profile = profile;
    next();
};

module.exports = { getProfile };