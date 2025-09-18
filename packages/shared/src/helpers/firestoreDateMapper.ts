import firebase from 'firebase/compat';

type Document =
  | firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>
  | firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>;

export function firestoreDateMapper<T extends firebase.firestore.DocumentData>(
  doc: Document,
  mapper?: (data: T) => T
): T {
  if (!doc.exists) {
    throw new Error('Document not exists');
  }

  const data = mapper ? mapper(doc.data() as T) : (doc.data() as T);

  return {
    ...data,
    id: doc.id,
    createdAt: data.createdAt ? data.createdAt.toDate?.() : new Date(),
    updatedAt: data.updatedAt ? data.updatedAt.toDate?.() : new Date(),
  };
}

function transformFirestoreTimestampIntoDateInCollection<T extends object>(
  document: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>,
  mapper?: (data: T) => T
) {
  const data = mapper ? mapper(document.data() as T) : document.data();

  return {
    id: document.id,
    ...data,
    createdAt: 'createdAt' in data ? data.createdAt?.toDate() : null,
    updatedAt: 'updatedAt' in data ? data.updatedAt?.toDate() : null,
  } as T;
}

export function getDocumentConverter<T extends object>(
  mapper?: (data: T) => T
): firebase.firestore.FirestoreDataConverter<T> {
  return {
    toFirestore: (document: T) => document,
    fromFirestore: (document) =>
      transformFirestoreTimestampIntoDateInCollection<T>(document, mapper),
  };
}
