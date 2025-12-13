
import { User, Review } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Alice Reader',
  avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&h=200&q=80',
  bio: 'Avid reader of sci-fi and historical fiction. Always looking for the next great adventure.',
  joinedDate: 'Jan 2023',
  isAdmin: true,
  following: ['u_sarah'], // Mock following 'Sarah Jenkins' by default
  followers: [],
};

// Initial reviews to populate the feed before user adds any
export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1',
    bookId: 'b1',
    userId: 'u2',
    userName: 'John Doe',
    rating: 5,
    content: 'Absolutely couldn\'t put it down. The twist at the end was masterfully executed!',
    date: '2023-10-15'
  },
  {
    id: 'r2',
    bookId: 'b1',
    userId: 'u3',
    userName: 'Jane Smith',
    rating: 3,
    content: 'Good writing, but the pacing felt a bit slow in the middle chapters.',
    date: '2023-11-02'
  }
];
