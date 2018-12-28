import { Post } from './post.model';
import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import { map } from 'rxjs/operators';
import {Router} from '@angular/router';
@Injectable()
export class PostsService {
  private postsUpdated = new Subject<{posts: Post[], postCount: number }>();
  private posts: Post[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`; //`` are template expression: dynamic add values into a normal string
    this.http.get<{message: string, posts: any, maxPosts: number}>
    ('http://localhost:3000/api/posts'+queryParams)
      .pipe(map((item) => {
        return {
          posts:
          item.posts.map(post => {
          return {
            title: post.title,
            content: post.content,
            id: post._id,
            imagePath: post.imagePath
          }
        }) ,
          maxPosts: item.maxPosts
      }
      }))
      .subscribe((transformedPostsData) => {
        this.posts = transformedPostsData.posts;
        this.postsUpdated.next({posts: [...this.posts],
        postCount: transformedPostsData.maxPosts });
      });

  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string, image: File) {
    // const post = {
    //   id: null,
    //   title: title,
    //   content: content
    // };
    const postData = new FormData();
    postData.append("title", title);
    postData.append('content', content);
    postData.append('image', image, title);


    this.http
      .post<{message: string, post: Post}>(
        'http://localhost:3000/api/posts',
        postData
      )
      .subscribe((responseData) => {

        this.router.navigate(["/"]);
      })

  }

  deletePost(postId: string) {
    return this.http.delete("http://localhost:3000/api/posts/" + postId);
  }

  getPost(id: string) {
    return this.http.get<{
      _id: string,
      title: string,
      content: string,
      imagePath: string
    }>('http://localhost:3000/api/posts/' + id);
  }

  updatePost(id: string, title: string, content: string, image: File | string) {

    let postData: Post | FormData;
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image);

    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image
      }
    }
    this.http.put('http://localhost:3000/api/posts/' + id, postData).subscribe(response => {
      this.router.navigate(["/"]);
    });

  }

}