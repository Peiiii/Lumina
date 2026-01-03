
import { useFragmentsStore } from '../stores/fragmentsStore';
import { useAppStore } from '../stores/appStore';
import { Fragment, NoteType } from '../types';

const INITIAL_MOCK_DATA: Fragment[] = [
  {
    id: 'mock-1',
    content: "下个季度想尝试用 WebGPU 重构渲染管线，提升移动端 3D 画布的流畅度。",
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    tags: ['技术探索', '工作'],
    type: 'fragment',
    status: 'pending'
  },
  {
    id: 'mock-2',
    content: "灵感：一个基于物理引擎的笔记应用，所有的碎片像原子一样可以互相吸引或排斥。",
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    tags: ['创意', '产品'],
    type: 'fragment',
    status: 'pending'
  },
  {
    id: 'mock-3',
    content: "准备周一的团队同步会议，重点讨论 AI 录入系统的准确率提升方案。",
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    tags: ['待办', '管理'],
    type: 'todo',
    status: 'pending'
  },
  {
    id: 'mock-4',
    content: "书单推荐：卡洛·罗韦利的《时间的秩序》，探讨物理学与时间的本质。",
    createdAt: Date.now() - 1000 * 60 * 60 * 28,
    tags: ['阅读', '自我提升'],
    type: 'fragment',
    status: 'pending'
  },
  {
    id: 'mock-5',
    content: "周六去那家新开的咖啡店试试他们的埃塞俄比亚手冲，顺便带上 iPad 写写代码。",
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    tags: ['生活', '探店'],
    type: 'todo',
    status: 'pending'
  }
];

export class FragmentsManager {
  init = () => {
    const saved = localStorage.getItem('lumina_fragments');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) {
        useFragmentsStore.setState({ fragments: parsed });
        return;
      }
    }
    useFragmentsStore.setState({ fragments: INITIAL_MOCK_DATA });
  };

  saveToLocal = () => {
    const { fragments } = useFragmentsStore.getState();
    if (fragments.length > 0) {
      localStorage.setItem('lumina_fragments', JSON.stringify(fragments));
    }
  };

  addFragment = (contentOverride?: string) => {
    const content = contentOverride ?? useAppStore.getState().inputValue;
    if (!content.trim()) return;

    const newFragment: Fragment = {
      id: Date.now().toString(),
      content: content,
      createdAt: Date.now(),
      tags: [],
      type: 'fragment',
      status: 'pending'
    };

    useFragmentsStore.setState((state) => ({
      fragments: [newFragment, ...state.fragments]
    }));
    useAppStore.setState({ inputValue: '' });
    this.saveToLocal();
  };

  deleteFragment = (id: string) => {
    useFragmentsStore.setState((state) => ({
      fragments: state.fragments.filter(f => f.id !== id)
    }));
    this.saveToLocal();
  };

  toggleTodo = (id: string) => {
    useFragmentsStore.setState((state) => ({
      fragments: state.fragments.map(f => {
        if (f.id === id) {
          const isTodo = f.type === 'todo';
          return { 
            ...f, 
            type: (isTodo ? 'fragment' : 'todo') as NoteType, 
            status: (isTodo ? 'pending' : 'completed') as 'pending' | 'completed'
          };
        }
        return f;
      })
    }));
    this.saveToLocal();
  };

  simulateRecording = () => {
    useAppStore.setState({ isRecording: true });
    setTimeout(() => {
      useAppStore.setState({ isRecording: false });
      const fakeVoiceResult = "我想在下周开始学习 WebGL，并将它应用在 Lumina 的画布可视化中。";
      this.addFragment(fakeVoiceResult);
    }, 2500);
  };
}
