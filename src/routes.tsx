import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { Login } from '@/pages/Login';
import { BusinessList } from './pages/businesses/BusinessList';
import { CategoryList } from './pages/categories/CategoryList';
import { EventList } from '@/pages/events/EventList';
import { EventDetail } from '@/pages/events/EventDetail';
import { EventImageEditor } from '@/pages/events/EventImageEditor';
import { KeywordList } from './pages/keywords/KeywordList';
import { PrivateRoute } from '@/components/PrivateRoute';
import { CreateEvent } from "@/pages/events/CreateEvent";
import { CreateBusiness } from "@/pages/businesses/CreateBusiness";
import { BusinessUserReview } from './pages/users/BusinessUserReview';
import { EventCategoryList } from '@/pages/events/EventCategoryList';
import { Profile } from './pages/Profile';
import { ContactRequests } from './pages/contacts/ContactRequests';
import { ContactRequestDetail } from './pages/contacts/ContactRequestDetail';
import { Analytics } from './pages/Analytics';
import { BusinessUserList } from './pages/users/BusinessUserList';
import { EditBusinessUser } from './pages/users/EditBusinessUser';
import { EditBusiness } from './pages/businesses/EditBusiness';
import NewsManagement from './pages/NewsManagement';
import { JobOffers } from '@/pages/JobOffers';
import { JobCategories } from '@/pages/JobCategories';
import { JobOfferForm } from '@/pages/job-offers/JobOfferForm';
import { ChatroomManagement } from '@/pages/chatrooms/ChatroomManagement';
import { ChatMessages } from '@/pages/chatrooms/ChatMessages';
import MittmachMittwoch from '@/pages/MittmachMittwoch';
import SpecialPollDetail from '@/pages/SpecialPollDetail';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/businesses" element={<BusinessList />} />
        <Route path="/businesses/:id/edit" element={<EditBusiness />} />
        <Route path="/categories" element={<CategoryList />} />
        <Route path="/events" element={<EventList />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/events/image-editor" element={<EventImageEditor />} />
        <Route path="/events/:id/image-editor" element={<EventImageEditor />} />
        <Route path="/keywords" element={<KeywordList />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/create-business" element={<CreateBusiness />} />
        <Route path="/users/business/review" element={<BusinessUserReview />} />
        <Route path="/business-users" element={<BusinessUserList />} />
        <Route path="/business-users/:id/edit" element={<EditBusinessUser />} />
        <Route path="/contacts" element={<ContactRequests />} />
        <Route path="/contacts/:id" element={<ContactRequestDetail />} />
        <Route path="/event-categories" element={<EventCategoryList />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/news-management" element={<NewsManagement />} />
        <Route path="/job-offers" element={<JobOffers />} />
        <Route path="/job-offers/create" element={<JobOfferForm />} />
        <Route path="/job-offers/:id" element={<JobOfferForm />} />
        <Route path="/job-categories" element={<JobCategories />} />
        <Route path="/chatrooms" element={<ChatroomManagement />} />
        <Route path="/chatrooms/:chatroomId/messages" element={<ChatMessages />} />
        <Route path="/mittmach-mittwoch" element={<MittmachMittwoch />} />
        <Route path="/mittmach-mittwoch/:pollId" element={<SpecialPollDetail />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
} 