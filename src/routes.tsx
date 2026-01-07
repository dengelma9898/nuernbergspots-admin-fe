import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { Login } from '@/pages/Login';
import { BusinessList } from './pages/businesses/BusinessList';
import { CategoryList } from './pages/categories/CategoryList';
import { EventList } from '@/pages/events/EventList';
import { EventDetail } from '@/pages/events/EventDetail';
import { EventImageEditor } from '@/pages/events/EventImageEditor';
import { EventScraper } from '@/pages/events/EventScraper';
import { EventScraperDetail } from '@/pages/events/EventScraperDetail';
import { KeywordList } from './pages/keywords/KeywordList';
import { PrivateRoute } from '@/components/PrivateRoute';
import { CreateEvent } from '@/pages/events/CreateEvent';
import { CopyEvent } from '@/pages/events/CopyEvent';
import { CreateBusiness } from '@/pages/businesses/CreateBusiness';
import { BusinessUserReview } from './pages/users/BusinessUserReview';
import { EventCategoryList } from '@/pages/events/EventCategoryList';
import { Profile } from './pages/Profile';
import { ContactRequests } from './pages/contacts/ContactRequests';
import { ContactRequestDetail } from './pages/contacts/ContactRequestDetail';
import { Analytics } from './pages/Analytics';
import { BusinessUserList } from './pages/users/BusinessUserList';
import { EditBusinessUser } from './pages/users/EditBusinessUser';
import { UserBlockManagement } from './pages/users/UserBlockManagement';
import { UserManagement } from './pages/users/UserManagement';
import { EditBusiness } from './pages/businesses/EditBusiness';
import NewsManagement from './pages/NewsManagement';
import { JobOffers } from '@/pages/JobOffers';
import { JobCategories } from '@/pages/JobCategories';
import { JobOfferForm } from '@/pages/job-offers/JobOfferForm';
import { ChatroomManagement } from '@/pages/chatrooms/ChatroomManagement';
import { ChatMessages } from '@/pages/chatrooms/ChatMessages';
import MittmachMittwoch from '@/pages/MittmachMittwoch';
import SpecialPollDetail from '@/pages/SpecialPollDetail';
import { AccountManagement } from './pages/AccountManagement';
import { DowntimeManagement } from './pages/DowntimeManagement';
import { AdventCalendarManagement } from './pages/advent-calendar/AdventCalendarManagement';
import { AdventCalendarForm } from './pages/advent-calendar/AdventCalendarForm';
import { AdventCalendarParticipants } from './pages/advent-calendar/AdventCalendarParticipants';
import { LegalManagement } from './pages/legal/LegalManagement';
import { LegalDocumentEdit } from './pages/legal/LegalDocumentEdit';
import { AppVersionManagement } from './pages/AppVersionManagement';

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
        <Route path="/events/scraper" element={<EventScraper />} />
        <Route path="/events/scraper/:id" element={<EventScraperDetail />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/events/:id/copy" element={<CopyEvent />} />
        <Route path="/events/image-editor" element={<EventImageEditor />} />
        <Route path="/events/:id/image-editor" element={<EventImageEditor />} />
        <Route path="/keywords" element={<KeywordList />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/create-business" element={<CreateBusiness />} />
        <Route path="/users/business/review" element={<BusinessUserReview />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/business-users" element={<BusinessUserList />} />
        <Route path="/business-users/:id/edit" element={<EditBusinessUser />} />
        <Route path="/users/block-management" element={<UserBlockManagement />} />
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
        <Route path="/account-management" element={<AccountManagement />} />
        <Route path="/downtime-management" element={<DowntimeManagement />} />
        <Route path="/advent-calendar" element={<AdventCalendarManagement />} />
        <Route path="/advent-calendar/new" element={<AdventCalendarForm />} />
        <Route path="/advent-calendar/:id/edit" element={<AdventCalendarForm />} />
        <Route path="/advent-calendar/:id/participants" element={<AdventCalendarParticipants />} />
        <Route path="/legal" element={<LegalManagement />} />
        <Route path="/legal/:type/edit" element={<LegalDocumentEdit />} />
        <Route path="/app-version-management" element={<AppVersionManagement />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
