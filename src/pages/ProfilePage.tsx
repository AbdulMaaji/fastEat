import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { History, MapPin, CreditCard, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileEditor from '../components/ProfileEditor';

const ProfilePage: React.FC = () => {
    const {
        userProfile,
        setUserProfile,
        orders,
        favorites,
        vendors,
    } = useAppContext();

    const navigate = useNavigate();
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    if (isEditingProfile) {
        return (
            <ProfileEditor
                initialProfile={userProfile}
                onSave={(updated) => {
                    setUserProfile(updated);
                    setIsEditingProfile(false);
                }}
                onCancel={() => setIsEditingProfile(false)}
            />
        );
    }

    return (
        <div className="bg-white min-h-screen pb-24">
            <div className="p-6">
                {/* Social Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="w-20 h-20 rounded-full p-1 border-2 border-brand-orange/20">
                        <img src={userProfile.avatar} className="w-full h-full rounded-full object-cover" alt="Profile" />
                    </div>
                    <div className="flex-1 ml-6 flex justify-around">
                        <div className="text-center">
                            <span className="block font-black text-lg text-brand-dark">{orders.filter(o => o.status === 'COMPLETED').length}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Orders</span>
                        </div>
                        <div className="text-center">
                            <span className="block font-black text-lg text-brand-dark">{favorites.size}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Favorites</span>
                        </div>
                        <div className="text-center">
                            <span className="block font-black text-lg text-brand-orange">
                                {Object.values(userProfile.loyaltyPoints).reduce((a: number, b: number) => a + b, 0)}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Points</span>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h1 className="text-lg font-bold text-brand-dark">{userProfile.name}</h1>
                    <p className="text-sm text-gray-500 leading-relaxed">{userProfile.bio}</p>
                </div>

                <div className="flex gap-3 mb-8">
                    <button
                        onClick={() => setIsEditingProfile(true)}
                        className="flex-1 bg-gray-100 text-brand-dark py-2.5 rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors"
                    >
                        Edit Profile
                    </button>
                    <button className="flex-1 bg-gray-100 text-brand-dark py-2.5 rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors">
                        Share Profile
                    </button>
                </div>

                {/* Sections */}
                <div className="space-y-6">
                    <div>
                        <h3 className="font-bold text-xs text-gray-400 uppercase mb-3">My Account</h3>
                        <div className="bg-gray-50 rounded-2xl p-1">
                            <button
                                onClick={() => navigate('/history')}
                                className="w-full flex items-center justify-between p-3 hover:bg-white rounded-xl transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-full shadow-sm text-brand-orange"><History size={16} /></div>
                                    <span className="font-bold text-sm text-brand-dark">Order History</span>
                                </div>
                                <ChevronRight size={16} className="text-gray-300" />
                            </button>
                            <button
                                onClick={() => setIsEditingProfile(true)}
                                className="w-full flex items-center justify-between p-3 hover:bg-white rounded-xl transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-full shadow-sm text-blue-500"><MapPin size={16} /></div>
                                    <span className="font-bold text-sm text-brand-dark">Saved Addresses</span>
                                </div>
                                <ChevronRight size={16} className="text-gray-300" />
                            </button>
                            <button className="w-full flex items-center justify-between p-3 hover:bg-white rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-full shadow-sm text-green-500"><CreditCard size={16} /></div>
                                    <span className="font-bold text-sm text-brand-dark">Payment Methods</span>
                                </div>
                                <ChevronRight size={16} className="text-gray-300" />
                            </button>
                        </div>
                    </div>

                    {/* Favorites Grid */}
                    <div>
                        <h3 className="font-bold text-xs text-gray-400 uppercase mb-3">Favorites</h3>
                        {favorites.size === 0 ? (
                            <p className="text-xs text-gray-400 italic">No favorites yet.</p>
                        ) : (
                            <div className="grid grid-cols-4 gap-3">
                                {Array.from(favorites).map(vid => {
                                    const v = vendors.find(ven => ven.id === vid);
                                    if (!v) return null;
                                    return (
                                        <div
                                            key={vid}
                                            className="flex flex-col items-center cursor-pointer group"
                                            onClick={() => navigate(`/profile/${v.id}`)}
                                        >
                                            <div className="w-14 h-14 rounded-full border-2 border-white shadow-md overflow-hidden mb-1 group-hover:border-brand-orange transition-colors">
                                                <img src={v.avatar} className="w-full h-full object-cover" alt={v.name} />
                                            </div>
                                            <span className="text-[10px] font-medium text-gray-600 truncate w-full text-center">{v.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
