import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { BusinessList } from './pages/businesses/BusinessList';
import { CategoryList } from './pages/categories/CategoryList';
import { EventList } from '@/pages/events/EventList';
import { EventDetail } from '@/pages/events/EventDetail';
import { KeywordList } from './pages/keywords/KeywordList';
import { PrivateRoute } from './components/PrivateRoute.tsx';
import { CreateEvent } from "@/pages/events/CreateEvent";
import { CreateBusiness } from "@/pages/businesses/CreateBusiness";
import { BusinessUserReview } from './pages/users/BusinessUserReview';
import { EventCategoryList } from '@/pages/events/EventCategoryList';
import { Profile } from './pages/Profile';
import { ContactRequests } from './pages/contacts/ContactRequests.tsx';
import { ContactRequestDetail } from './pages/contacts/ContactRequestDetail.tsx';
import { Analytics } from './pages/Analytics.tsx';
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/businesses" element={<BusinessList />} />
        <Route path="/categories" element={<CategoryList />} />
        <Route path="/events" element={<EventList />} />
        <Route path="/keywords" element={<KeywordList />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/create-business" element={<CreateBusiness />} />
        <Route path="/users/business/review" element={<BusinessUserReview />} />
        <Route path="/contacts" element={<ContactRequests />} />
        <Route path="/contacts/:id" element={<ContactRequestDetail />} />
        <Route path="/event-categories" element={<EventCategoryList />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
} 