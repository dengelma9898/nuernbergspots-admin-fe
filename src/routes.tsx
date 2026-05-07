import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { Login } from '@/pages/Login';
import { BusinessList } from './pages/businesses/BusinessList';
import { CategoryList } from './pages/categories/CategoryList';
import { EventList } from '@/pages/events/EventList';
import { EventDetail } from '@/pages/events/EventDetail';
import { EventImageEditor } from '@/pages/events/EventImageEditor';
import { CsvEventImport } from '@/pages/events/CsvEventImport';
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
import { FeatureFlagsManagement } from './pages/FeatureFlagsManagement';
import { EasterEggManagement } from './pages/easter-egg/EasterEggManagement';
import { EasterEggForm } from './pages/easter-egg/EasterEggForm';
import { EasterEggDetail } from './pages/easter-egg/EasterEggDetail';
import { TaxiStandManagement } from './pages/taxi-stands/TaxiStandManagement';
import { TaxiStandForm } from './pages/taxi-stands/TaxiStandForm';
import { CuratedSpotList } from '@/pages/curated-spots/CuratedSpotList';
import { CuratedSpotForm } from '@/pages/curated-spots/CuratedSpotForm';
import { CuratedSpotsUserRatingsSettingsPage } from '@/pages/curated-spots/CuratedSpotsUserRatingsSettingsPage';
import { SpotKeywordManagement } from '@/pages/spot-keywords/SpotKeywordManagement';

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
        <Route path="/events/import/csv" element={<CsvEventImport />} />
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
        <Route path="/feature-flags" element={<FeatureFlagsManagement />} />
        <Route path="/easter-egg-hunt" element={<EasterEggManagement />} />
        <Route path="/easter-egg-hunt/new" element={<EasterEggForm />} />
        <Route path="/easter-egg-hunt/:id/edit" element={<EasterEggForm />} />
        <Route path="/easter-egg-hunt/:id" element={<EasterEggDetail />} />
        <Route path="/taxi-stands" element={<TaxiStandManagement />} />
        <Route path="/taxi-stands/new" element={<TaxiStandForm />} />
        <Route path="/taxi-stands/:id/edit" element={<TaxiStandForm />} />
        <Route path="/curated-spots" element={<CuratedSpotList />} />
        <Route path="/curated-spots/settings" element={<CuratedSpotsUserRatingsSettingsPage />} />
        <Route path="/curated-spots/new" element={<CuratedSpotForm />} />
        <Route path="/curated-spots/:id/edit" element={<CuratedSpotForm />} />
        <Route path="/spot-keywords" element={<SpotKeywordManagement />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
