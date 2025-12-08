import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Camera } from 'lucide-react';

interface ProfileEditorProps {
    initialProfile: UserProfile;
    onSave: (profile: UserProfile) => void;
    onCancel: () => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ initialProfile, onSave, onCancel }) => {
    const [profile, setProfile] = useState<UserProfile>(initialProfile);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(profile);
    };

    return (
        <div className="bg-white min-h-screen pb-24">
            <div className="p-6">
                <h2 className="text-xl font-bold mb-6 text-brand-dark">Edit Profile</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border-2 border-gray-100 overflow-hidden">
                                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <button
                                type="button"
                                className="absolute bottom-0 right-0 bg-brand-orange text-white p-2 rounded-full shadow-lg"
                            >
                                <Camera size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Name</label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={e => setProfile({ ...profile, name: e.target.value })}
                                className="w-full bg-gray-50 border-none rounded-xl p-3 font-medium text-brand-dark focus:ring-2 focus:ring-brand-orange/20"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Bio</label>
                            <textarea
                                value={profile.bio}
                                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                className="w-full bg-gray-50 border-none rounded-xl p-3 font-medium text-brand-dark focus:ring-2 focus:ring-brand-orange/20 min-h-[100px]"
                                maxLength={150}
                            />
                            <p className="text-right text-xs text-gray-400 mt-1">{profile.bio.length}/150</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Phone Number</label>
                            <input
                                type="tel"
                                value={profile.phone}
                                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                className="w-full bg-gray-50 border-none rounded-xl p-3 font-medium text-brand-dark focus:ring-2 focus:ring-brand-orange/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email</label>
                            <input
                                type="email"
                                value={profile.email}
                                disabled
                                className="w-full bg-gray-100 border-none rounded-xl p-3 font-medium text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-gray-100 text-brand-dark py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-brand-orange text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-orange/30 hover:shadow-brand-orange/40 transition-shadow"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileEditor;
